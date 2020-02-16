---
title: Unit Testing .NET Core with XUnit - Part Two
date: "2020-02-11"
description: "Unit Testing .NET Core with xUnit, NSubstitute, and Fluent Assertions"
---

This is Part Two of a Two Part series on Unit Testing .NET Core with XUnit.

In this part I will cover mocking with NSubstitute and writing better assertions with Fluent Assertions.

## NSubstitute
Most classes that does anything non-trivial will ususally have dependencies.  These dependencies could access the network, disk, database, or themselves might have dependencies that access these also.  The rabbit hole can get pretty deep, pretty quick here.  When unit testing, we want to abstract these depedencies away for two reasons.
1. It allows our tests to concentrate on our Subject Under Test (SUT)
2. It allows our tests to be run easier, without having dependencies on databases etc
3. It allows our tests to run much quicker, which ultimately gives us feedback on broken code faster 

This abstracting is done through mocking.  There are several good mocking frameworks out there like Moq, Rhino Mocks, and FakeItEasy.  My personal favourite is NSubstutute.  They all do similar things, so it mostly comes down to the syntax, in which case NSubstutite is the winner. 

Consider the following code:

```csharp
public class Cart
{
    private readonly ICartRepository cartRepository;

    public Cart(ICartRepository cartRepository)
    {
        this.cartRepository = cartRepository;
    }

    public void AddOrder(Order order)
    {
        cartRepository.AddOrder(order);
    }

    public decimal GetTotal()
    {
        var orders = cartRepository.GetAll();
        return orders.SelectMany(o => o.OrderLines).Sum(ol => ol.Price * ol.Units);
    }
}

public interface ICartRepository
{
    void AddOrder(Order order);
    List<Order> GetAll();
}

public class Order
{
    public List<OrderLine> OrderLines { get; set; }
}

public class OrderLine
{
    public string Description { get; set; }
    public int Units { get; set; }
    public decimal Price { get; set; }
}
```

In order to unit test the Cart, we need to mock out the repository.  First, let's install NSubstitute:

```bash
Install-Package NSubstitute
```

We can mock out our repository as follows:

```csharp
public class CartTests
{
    [Fact]
    public void Cart_Calculates_Correct_Sum()
    {
        // Arrange
        var orderRepo = Substitute.For<ICartRepository>();
        var sut = new Core.Cart(orderRepo);

        // Act
        var result = sut.GetTotal();

        // Assert
        Assert.Equal(10, result);
    }
}
```

Now, our unit test will run.  However, how do we know what the total will be?  Where do the orders come from?  We need to add some more code to our mock.

```csharp
public class CartTests
{
    [Fact]
    public void Cart_Calculates_Correct_Sum()
    {
        // Arrange
        var orderRepo = Substitute.For<ICartRepository>();
        orderRepo.GetAll().ReturnsForAnyArgs(CreateOrders());
        var sut = new Core.Cart(orderRepo);

        // Act
        var result = sut.GetTotal();

        // Assert
        Assert.Equal(110, result);
    }

    private List<Order> CreateOrders() => new List<Order>
    {
        new Order
        {
            OrderLines = new List<OrderLine>
            {
                new OrderLine{ Description = "Black Shoes", Price = 80.00M, Units = 1},
                new OrderLine{ Description = "Striped Sockets", Price = 10.00M, Units = 3}
            }
        }
    };
}
```

Here we are replacing the usual implementation of `ICartRepository` with out own.  When the `Cart` calls `ICartRepository.GetAll` internally, we are stubbing out this method to return our own known data.  This allows the database to be bypassed and at the same time gives our tests predecitable results.  This is very powerful.

If you find that you are having to mock out a large number of dependencies in order to write out a unit test, that is indication that your class is probably doing too many things.  You might want to refactor it and split out the functionality so that it does only one thing, but does it well (Single Responsibility Principle).

## Fluent assertions
Now, we are in a great position.  We have unit tests for our code, they are runningg fast, and we are mocking out external resources.  There is still one kink for us to iron out.  Let's look at our assertions

```csharp
Assert.Equal(110, result);
```

When constructing these assertions, you first need to think about the kind of assertion you want to test, then what the expected and actual results are.  If you are like me I never seem to get these last two in the correct order.

Let's try to achieve the same with *Fluence Assertions*:

```bash
Install-Package FluentAssertions
```

Once installed we can change our assertion to:

```csharp
result.Should().Be(110);
```

This reads much more naturally left-to-right.  First we reference what we want to test. `result`.  Then we add `Should()` which is the secret sauce to opening up Fluence Assertions.  In this case we are simply using `Be()` for the actual test which is equivalent to `Assert.Equal()` above.

Some other tests provided are:
- `BeGreaterThan()`
- `NotBe()`
- `BeLessThan()`
- `BeInRange()`
- `BeApproximately()`
- `BeOfType()`
- `BeOneOf()`
- and more!

And if you are testing a collection:
- `HaveCount()`
- `BeEmpty()`
- `NotBeEmpty()`
- `BeEquivalentTo()`
- `BeInAscendingOrder()`
- `BeInDescendingOrder()`
- `BeSubsetOf()`
- `Contain()`
- `HaveElementAt()`
- and many more!

As you can see Fluent Assertions provides far more test helpers than what is built into xUnit (and MSTest / NUnit).  For more info see the [documentation](https://fluentassertions.com/introduction).

## Resources
- [xUnit](https://xunit.net/)
- [NSubstitute](https://nsubstitute.github.io/)
- [Fluent Assertions](https://fluentassertions.com/)

## Summary
This is the end of the two part series on Unit Testing with .NET Core and xUnit.  In this article you've seen how to easily mock out depedencies with NSubstitute, and how to test a wider range of assertions with Fluent Assertions.

I hope ths series has demonstrated that unit testing is not that hard.  Having an understanding of how to test, can help us write better code (e.g. by ensuring dependencies are injected and not hardcoded).






