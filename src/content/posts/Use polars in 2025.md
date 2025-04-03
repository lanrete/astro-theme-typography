---
title: Use polars in 2025
pubDate: 2025-04-01
categories: ['Articles', 'python', 'pandas', 'polars', 'data-analytics']
description: 'It is year 2025, stop using pandas and start embracing polars.'
slug: 'use-polars-in-2025'
draft: false
---

`pandas` has served me very well in my data analytics career, it was, and still is the absolute powerhouse for (almost) every thing you need for day-to-day analytics. Even when it occasionally falls short on some advanced analytical workload, there's a huge ecosystem that you can easily plug into for just a bit more complexity like `scipy`, `numpy` and `scikit-learn`. 

That being said, I haven't been using `pandas` professionally for a year now, as the new kid in town has improved so many aspects of `pandas` that I didn't know I dislike. Whether you're a veteran or a newbie in the field of data analytics, I would strongly suggest you try `polars` in your next analytical project.

## What's `polars`

I will keep this section short. `polars` is a data analysis module written in `rust`, it provides a similar `DataFrame` structure as `pandas` does, but offers much faster performance.

To use `polars` in your next project, checkout this [link](https://docs.pola.rs/).

## Why `polars` or What's wrong with `pandas`

Before I go into the details I want to make it perfectly clear that **I have huge respect for the team behind `pandas`, the product is absolutely amazing. Over the years there has been many changes and improvements in the industry, and therefore I believe `polars` is a better fit in 2025.**

For me personally, there is three major reasons why `polars` is better:

1. Speed
2. API design
3. Type system

### Speed

There's not much to say here, `pandas` itself is never known as the fastest framework on this planet, `polars` is much faster in almost every operations. There is enough [benchmark](https://pola.rs/posts/benchmarks/) to demonstrate this. 

Performance wise, `polars` benefits a lot from its `rust` core, the lazy evaluation optimization and the underlying Arrow memory model (which `pandas` also support in the latest version). Just simply try it and you can really feel the difference.

### API design

The API design of `pandas` can sometimes be a bit confusing. There are two parts that causes me most troubles when dealing with `pandas`

1. `inplace=True`/`inplace=False`

    Almost every `pandas` API comes with a `inplace` parameter. This offer the flexibility on if you the operation to return a new `DataFrame`, or modify the current one directly. On paper this seems perfect, but this creates some ambiguities in your code base.

    One ambiguity here is that your IDE don't exactly know for sure the return type of the function. The source code can only specify the return type as `pd.DataFrame | None`, this completely breaks the auto-completion and the best solution that I found is to manually specify the type after every function call with `inplace`.
    
    Another ambiguity happens when you need to work with someone else on the similar code bases, as you may have different preference on `inplace=True` or `inplace=False`. Or even worse, your colleague does not know how `inplace` change the behavior. I have quite some debugging session only to drill down to a mis-match between `inplace` and assignment.
    
1. `.reset_index()`

    `pandas` provide a `index` feature for faster filtering and selection on rows, this could be helpful but in many situations I found myself just wish the `index` can be operated just as any other regular columns. Let alone the complex situation where there's a `multi-index` coming from a `groupby` operation. I tried to utilize the `index` properly but after so many projects, I just defaulted to run `df.reset_index(inplace=True)` after any operations that could potentially change the `index`.

In general, `pandas` provide flexibilities on inplace operation and index column, but I found the flexibilty not worth the inconvenience. `polars` on other hand has a more straightforward API design, there is no inplace action, every operation will return a new `DataFrame`. There is no specific index, every column is treated the same. As a result, it relief a lot of mental burden for me when I'm writing the code.

### Type system

`pandas` type system is ... a bit unclear at best. The numerical values use the `np.float/np.int` type, string values is `object`, datetime values use `pd.Datetime`. Most of the cases you need to do the type casting yourself and there is no a standardized method on null values, as you have `np.nan` for numerical, `null` for string and `pd.NaT` for datetime. All of these create a mental burden over the type system.

`polars` on the other hand has a more out-of-box solution on column types with a universal `null` value, an example as below:

csv file, noted that there is a missing value in every column.
```
float_col,int_col,str_col,date_col
,2,a,2025-01-01
2.0,,b,2025-02-01
3.0,4,,2025-03-01
4.0,5,d,
```

Using `pandas` to read the csv file and trying to parse the date:
```python
pd_df = pd.read_csv('./sample_df.csv', parse_dates=True)
print("Pandas schema:")
print(pd_df.dtypes)
print(pd_df)
```

Noted that while `pandas` does read the null values and use `nan` to represent it, it failed to recognize the types between `str_col` and `date_col`.

```output
Pandas schema:
float_col    float64
int_col      float64
str_col       object
date_col      object
dtype: object
   float_col  int_col str_col    date_col
0        NaN      2.0       a  2025-01-01
1        2.0      NaN       b  2025-02-01
2        3.0      4.0     NaN  2025-03-01
3        4.0      5.0       d         NaN
```

To properly parse the date, you have to manually run `pd.to_datetime` to cast the types, which will change the missing value from `NaN` to `NaT`, none of these are a deal breaker but small things like this pile up over time and create mental burden.

Using `polars`, it will give you the proper type and universal null value at first try.

```python
pl_df = pl.read_csv('./sample_df.csv', try_parse_dates=True)
print("Polars schema:")
print(pl_df.schema)
print(pl_df)
```

```output
Polars schema:
Schema({'float_col': Float64, 'int_col': Int64, 'str_col': String, 'date_col': Date})
shape: (4, 4)
┌───────────┬─────────┬─────────┬────────────┐
│ float_col ┆ int_col ┆ str_col ┆ date_col   │
│ ---       ┆ ---     ┆ ---     ┆ ---        │
│ f64       ┆ i64     ┆ str     ┆ date       │
╞═══════════╪═════════╪═════════╪════════════╡
│ null      ┆ 2       ┆ a       ┆ 2025-01-01 │
│ 2.0       ┆ null    ┆ b       ┆ 2025-02-01 │
│ 3.0       ┆ 4       ┆ null    ┆ 2025-03-01 │
│ 4.0       ┆ 5       ┆ d       ┆ null       │
└───────────┴─────────┴─────────┴────────────┘
```

## `polars` is not perfect

After saying so many good things about `polars`, I have to admit `polars` is not perfect as well, it is still a developing framework with tons of potential and room for improvements. Currently I have two biggest complaints about `polars`.

1. The `pl.col` is a bit too verbatim, `polars` is very strict and requires developers to make explicit effort to clarify if a string should be treated as column name or literal value. I'm looking forward to a more simple solution other than using `pl.col()` and `pl.lit()` everywhere.

1. The type system is too strict sometimes.

    I ran into this weird bug in my last project where I'm trying to make year-over-year comparision over same time period, for example to compare 2024-01-07~2024-01-15 to 2025-01-07~2025-01-15.
    
    My way around this is to create a helper numerical column using `date_helper=pl.col('event_date').dt.month * 100 + pl.col('event_date').dt.day`. By doing so I can simply do `filter(pl.col('date_helper') >= 107)` to filter both years data. (I'm sure there's a better way to do achieve the similar functionality, but this is how I do it)
    
    Above method ran good in `pandas`, but in `polars` I couldn't get the correct result. As it turns out, `.dt.month` gives you a `pl.Int8` which is between `-128` to `127`, and therefore my `date_helper` column will overflow for every month other than January, the solution is that I need to manually cast these into `pl.Int32` or `pl.Int16` to prevent the overflow.
    
    This is trade-off between a safe, efficient type system and ease-of-use. I hope `polars` can come up with a better balance between these two.
    
While your opinion might vary, I would strongly suggest you to try out `polars` in your next project.
