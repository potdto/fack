# Fack tutorial

## Basic overview
Fack is stack based, so every value that you write is added to the stack.  So for example, in the code below:
```javascript
"Hello world" print
```
The string `"Hello world"` is pushed to the stack, and then the function `print` is pushed. The function takes one argument, and so 'eats' the value and prints it to the console.
This means that all functions in fack use reverse polish notation. I have included, however, a special function that can change the placement of certain operations and also produce more reasonable results, similar to backticks in haskell.

```javascript

35 34 +  // returns 69
34 + 35; // also returns 69

35 34 -  // returns -1
35 - 34; // returns  1
```
The way this neat syntactic sugar works is that `;` is actually its own function. It is defined as follows:
```
f(x) <- f <- x <- ;
```
This basically means that what actually happened is:  
34 was pushed to the stack. [34]  
The plus operator was called. [(34 +)]  
35 was pushed to the stack. [(34 +), 35]  
the ; operator was called. [69]

As anyone who has previously coded in a function oriented language such as Haskell knows, this code demonstrates an idea called type currying, a great segway to.....

## Currying
Currying is the idea that if a function hasn't been supplied with enough arguments, instead of returning an error, which happens in imperative languages such as c++, it should return another function which expects the missing argument. For example:
```
> + help
{a + b} <- b <- a <- +
adds 2 numbers together.
[]
> 1 + help
b <- +
adds 1 to a number
[]
```
This shows that the `+` operator is a function that takes 2 numbers and returns another number, but if you only supply one argument to it, such as `1 +`, it returns another function which adds one to its input.

## The pipe character
While currying is very useful, it can also be very annoying when a function takes an argument it isn't supposed to.
For example:
```javascript
// If I want the stack to look like [1, (2 +)] where `(2+)` is a curried function, I can't use:
1 2 + // because the + operator will use both numbers.
// To solve this problem, I gave the | character a special role.
1 | 2 + // This returns our desired stack state. This is because the pipe character acted as a 'wall' to stop the + operator using any more stack elements.
```
## higher order functions

A higher order function is a function that takes another function as an argument. This used to be a novelty to function-oriented programming but most languages have this feature now. The example I will use is `map`. Map takes an array and a function and applies the function to the whole of the array.

```javascript
1 .. 10; // creates an array from 1 to 10
| 2 *    // a function takes a value and doubles it
map      // maps the function to every element.
         // Returns [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
```

## flip function
This is technically another higher order function but it is a bit interesting. Let's take a look at the help text:
```
(c <- a <- b) <- (c <- b <- a) <- \
Takes a function that takes 2 arguments and returns a function that takes the arguments in reversed order.
```
So this function is very useful when dealing with functions where the order of arguments matters, such as `-`. For example:
```javascript
1 .. 10; |2* map // We have seen that this doubles every value in the list...
```

```javascript
1 .. 10; |1 - map // but when we do this, it seems that instead of subtracting 1 from each element (n-1), it has done the inverse (1-n).
```

```javascript
// To solve this, we use the \ function.
1 .. 10; |1 |-\ map
// now this returns [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as expected.
```
There are loads more higher order functions, but I think I have covered the most interesting ones.
## lambda expressions

Again, used to be a function-oriented novelty, but now pretty much every language has them. For those of you new to programming, a lambda expression is a function that hasn't been given a name.

```javascript
(2 x * <- x) // a function which takes parameter x and doubles it
// we can make this function typed by doing:
(2 x * <- x number)
// so you might be wondering how to create functions with mutiple arguments?
(x y * <- y <- x) // like this!
```

## Including other files
You can include other files by using the import function:
```
> import help
{codeblock} <- s <- import
Imports tokens from another file using the file's location passed as a string.
[]
```