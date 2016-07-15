# Stylus Sort
Sorts stylus rules in-place based on a predefined order.
## Usage
```
Usage: stylus-sort [options] <path...>

Options:

  -h, --help     output usage information
  -V, --version  output the version number
  -c --config    configuration to sort by
```

### Shipped configurations
* csscomb
* yandex
* zen

### Example
```
stylus-sort --config yandex assets/css/
```
