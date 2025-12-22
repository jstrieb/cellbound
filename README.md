# Cellbound


<div align="center">
<a href="https://jstrieb.itch.io/cellbound" target="_blank">
<img src="https://github.com/jstrieb/cellbound/blob/master/public/opengraph_transparent.png?raw=true" />
</a>
</div>


[**Cellbound** is a fully-functional spreadsheet engine with a logic puzzle game
built on top.](https://jstrieb.itch.io/cellbound)

Spreadsheet cells support standard mathematical expressions and function calls,
as well as references to individual cells and ranges of cells. Cell references
use R1C1 reference style notation.

Cellbound was built for the [Langjam Gamejam in late
2025](https://itch.io/jam/langjamgamejam/rate/4136854).

> [!WARNING]
> 
> This is alpha-quality code. It is likely to have bugs. It was built in a week
> for a game jam.

Cellbound was inspired by [Code Grid](https://github.com/jstrieb/code-grid), and
was used as an opportunity to experiment with possible architectural and
syntactic changes to Code Grid before committing them to the main repository.
Cellbound was built from scratch without referring to the Code Grid codebase,
but lessons learned from Code Grid influenced the development of Cellbound.


# How it Works

## Code Table of Contents

The links below are listed in the order the code should be read to understand
the application from the highest to lowest level.

- [`Makefile`](Makefile) – build and run the application locally
- [`index.html`](index.html) and [`src/App.svelte`](src/App.svelte) – entrypoint
  to the main, high-level application (the index page mounts the App)
- [`src/Table.svelte`](src/Table.svelte) and
  [`src/Cell.svelte`](src/Cell.svelte) – interactive spreadsheet UI code
- [`src/formula.js`](src/formula.js) – formula parsing logic (start at the
  bottom of the file and go up)
- [`src/lib/store.js`](src/lib/store.js) – implementation of "rederivable"
  stores that can change their derived dependencies without invalidating their
  object reference
  - Every cell's value is a rederivable store that is rederived when its formula
    changes, and updated whenever any of its dependencies' values changes
- [`src/levels.js`](src/levels.js) – game level data
  - **THERE ARE SPOILERS AND LEVEL SOLUTIONS IN THIS FILE**
- [`src/parsers.js`](src/lib/parsers.js) – parser combinator library used for
  formula parsing
- [`src/formula-functions.js`](src/formula-functions.js) – "standard library"
  formula functions available in every spreadsheet
- [`src/global.css`](src/global.css) and [`public/*`](public/) – global
  stylesheet, favicons, etc.

## Cool Code Highlights

- Spreadsheet formulas are built on a custom Svelte store that is
  "[rederivable](src/lib/store.js)."
  It functions like a Svelte derived store, except it can add or remove
  dependencies it is derived from without changing its object reference.
- [Formulas are
  parsed](src/formula.js)
  using a custom [parser combinator
  implementation](src/lib/parsers.js).

## Running the Code

The [`Makefile`](Makefile) contains all of the steps to build, test, and
distribute the code. 

If you have [NodeJS](https://nodejs.org/en/download) installed, the following
will compile the code and package it into a ZIP file for distribution:

``` bash
make
```

To run a local version for live testing and debugging, run:

``` bash
make dev
```


# AI & LLM Disclosure

This code repository is *entirely human-written*. All bugs, errors, and
omissions are my own. 


# Project Status & Contributing

Cellbound is **not** under active development. 

It was built for a game jam, and though I may add code here and there, I am not
expecting to maintain it long-term.


# Acknowledgments

Thanks to [Logan Snow](https://github.com/lsnow99) and [Amy
Liu](https://www.youtube.com/watch?v=icy7BEzsca8) for help with ideation and
feedback on early prototypes.


