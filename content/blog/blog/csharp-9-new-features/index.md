---
title: C# 9.0 New Features
date: "2021-01-10"
description: "C# 9.0 New Features include records, top-level programs, init properties, pattern matching enhancements, source generators and more."
---

Happy New Year y'all!

C# 9.0 was released to GA along with .NET 5 November 2020.  It adds a number of new features to the language the biggest of which is ***records***.

Records provide a way to quickly define classes that are essentially property bags.  By default, they come with value semantics (opposed to reference semantics) and additional behaviour like equality and immutability for free.  Previously, you would have to implement these behaviours manually.  For any small value-based types (e.g. classes used for JSON serialisation), ask yourself if this is just a collection of values. If so, you may consider moving them to records. Also, considering records can be defined in a single line, you may want to re-consider the standard rule of one file per type. 😉
 
 Sometimes we write classes with constructors and with read-only to give us immutability.  Now to achieve the same thing we can use init-only properties instead.
 
 Source Code Generators use Roslyn APIs to add new source code to be compiled into the program.  They cannot modify existing source code.

 The full list of features included in C# 9.0 is:
- Records
- Init only setters
- Top-level statements
- Pattern matching enhancements
- Native sized integers
- Function pointers
- Suppress emitting localsinit flag
- Target-typed new expressions
- static anonymous functions
- Target-typed conditional expressions
- Covariant return types
- Extension GetEnumerator support for foreach loops
- Lambda discard parameters
- Attributes on local functions
- Module initializers
- New features for partial methods

 I have included examples of most of these on [Git Hub](https://github.com/danielmackay/CSharp9)

## Code
The code for this article can be found on [Git Hub](https://github.com/danielmackay/CSharp9)

## Resources
- [Microsoft Blog](https://devblogs.microsoft.com/dotnet/c-9-0-on-the-record/)
- [Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9/)
- [On .NET Show](https://www.youtube.com/watch?v=qiuzCWwYe0Y/)
- [NET Conf 2020](https://www.youtube.com/watch?v=x3kWzPKoRXc/)
