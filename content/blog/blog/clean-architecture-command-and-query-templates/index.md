---
title: Clean Architecture - Command and Query Templates
date: "2020-06-05"
description: "dotnet cli  templates for creating commands and queries in clean architecture"
---

## Introduction
Recently, we have been building a .NET Core Web API using the [Clean Architecture template](TODO).  A key part of this is using CQRS instead of having a service layer.  I'm a big fan of this approach as it allows you to focus on individual operations, and avoids ending up with bloated service classes that are doing too much and violating the [Single Responsibility Principle](TODO).

However, after finishing several features we quickly realised that we ended up creating A LOT of commands and queries, all of which have a similar structure.  So I set out to find some sort of templating engine that could help with the boilerplate code.

## Initial Problem
We needed to find a way to create two types of templates:

1. Commands
2. Queries

Both commands and queries will contain a request and a handler within the same file.  Additionally, a command will also have a validator in a separate file.  Both item templates will need to have dynamic string substitution so that they are created with the correct names and namespaces.

The commands and queries should also be grouped by type and request for a given domain entity.

If we were creating an application to manage pets, the end result for a command and query would look like:

```
Pets
├───Commands
|   └───CreatePet
|       ├───CreatePetCommand.cs
|       └───CreatePetCommandValidator.cs
|
└───Queries
    └───GetAllPets
        ├───GetAllPetsQuery.cs
        └───PetDto.cs

```

## Creating A Template
The dotnet templating engine provides an extensible framework for creating code templates.  These templates could be:
- single item template (e.g. a class)
- multiple item template (e.g. a collection of classes)
- a project template
- a solution / multi-project template

### Basics
First up, let's create a directory structure for work with the template.  This will look like the following:

```
parent_folder
└───working
    ├───.template.config
    |   └───template.json
    ├───OperationNameCommand.cs
    └───OperationNameCommandValidator.cs
```

This is a simplification of what we'll end up doing later, but it allows us to walk through the important parts with more clarity. 


The template meta data is defined by `template.json`:

```json
{
    "$schema": "http://json.schemastore.org/template",
    "author": "Daniel Mackay",
    "classifications": [ "Common", "Code", "CQRS" ],
    "identity": "CleanArchitecture.CQRS.Command",
    "name": "Clean Architecture CQRS Command",
    "shortName": "ca-command",
    "tags": {
      "language": "C#",
      "type": "item"
    },
    "sourceName": "OperationName"
  }
```

Most of this is self-explanatory, but there are two fields worth pointing out.  `shortName` is the name specified in the CLI to use this template.  `sourceName` defines a token we will use for substitution.  In our example, we will take all occurrences of **OperationName** in code, filenames, and folder names, and replace it with the name passed to the template.

The `Commands` and `OperationName` folders are not required for a dotnet template, but are being used here to provide organisation to the code generated.  These folders will be generated when the template is run.

`OperationNameCommand.cs` is the first file that this template will generate.  It will create a single file that contains both the command request, and the command handler.  As previously mentioned, all occurrences of **OperationName** will be replaced with the name passed to the template.

```cs
using SolutionName.Application.Common.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace SolutionName.Application.OperationName.Commands
{
    public class OperationNameCommand : IRequest<int>
    {
        // TODO: Command properties go here
    }

    public class OperationNameCommandHandler : IRequestHandler<OperationNameCommand, int>
    {
        private readonly IApplicationDbContext _context;

        public OperationNameCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(OperationNameCommand request, CancellationToken cancellationToken)
        {
            // TODO: Command handling goes here

            return -1;
        }
    }
}
```

Each command will also have a validator driven by FluentValidation.  I decided to keep examples of two types of validation in the template.  The first, is simply property validation that shows how to do basic checks with FluentValidation.  The second shows how to do validation that depends on a database (e.g. checking uniqueness of a field).

```cs
using SolutionName.Application.Common.Interfaces;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace SolutionName.Application.OperationName.Commands
{
    public class OperationNameCommandValidator : AbstractValidator<OperationNameCommand>
    {
        private readonly IApplicationDbContext _context;

        public OperationNameCommandValidator(IApplicationDbContext context)
        {
            _context = context;

            // Example Rule
            RuleFor(v => v.FirstName)
                .NotEmpty().WithName("First Name")
                .MaximumLength(200).WithName("First Name");

            // Example Rule with DB Valiation 
            RuleFor(v => v.PersonID)
                .NotEmpty().WithName("Person")
                .MustAsync(BeExistingPerson).WithMessage("Person does not exist.");
        }

        public async Task<bool> BeExistingPerson(int personID, CancellationToken cancellationToken)
        {
            return await _context.Persons
                .AnyAsync(p => p.PersonID == personID);
        }
    }
}
```

### Improvements
The preceding code and JSON files are all we need to define our template.  However, there are two more changes we would like to make.

1. Have the top-level solution name be configurable
2. Generate a folder structure to group commands together

We already have `SolutionName` placed holders in our namespace, but to make this configurable we need to add this a parameter to the template definition.  We can do this by modifying `template.json` as follows:

```json
{
    "$schema": "http://json.schemastore.org/template",
    "author": "Daniel Mackay",
    "classifications": [ "Common", "Code", "CQRS" ],
    "identity": "CleanArchitecture.CQRS.Command",
    "name": "Clean Architecture CQRS Command",
    "shortName": "ca-command",
    "tags": {
      "language": "C#",
      "type": "item"
    },
    "sourceName": "OperationName",
    "symbols": {
        "solutionName": {
            "type": "parameter",
            "defaultValue": "SolutionName",
            "replaces":"SolutionName"
        }
    }
  }
```

Next, I would like all commands to be grouped together in a folder, so that we can separate commands and queries.  I would also like to group together all files needed for a specific command.  This is especially important for queries when we might have multiple DTOs of VMs in the same folder.  Ultimately these will also be grouped by domain entity, but that is controlled by where the template is run, not the template itself.

We can do this by adjusting the folder structure as follows:

```
parent_folder
└───working
    ├───.template.config
    |   └───template.json
    └───Commands
        └───OperationName
            ├───OperationNameCommand.cs
            └───OperationNameCommandValidator.cs
```

## Testing
In order to test the template we first need a code base we can test against.  The easiest way to do this is to create a console application.

We first need to add a `test` folder into our directory structure:

```
parent_folder
├───test
└───working
    ├───.template.config
    |   └───template.json
    └───Commands
        └───OperationName
            ├───OperationNameCommand.cs
            └───OperationNameCommandValidator.cs
```

Then from a terminal run the following from the new test directory:

```
dotnet new console
```

### Installing

Before installing our template, we should first dig a little more into the dotnet command we will using to run the template.

From your terminal run `dotnet new` and you will see something like the following:

```
Templates                                         Short Name               Language          Tags
----------------------------------------------------------------------------------------------------------------------------------
Console Application                               console                  [C#], F#, VB      Common/Console
Class library                                     classlib                 [C#], F#, VB      Common/Library
WPF Application                                   wpf                      [C#]              Common/WPF
WPF Class library                                 wpflib                   [C#]              Common/WPF
WPF Custom Control Library                        wpfcustomcontrollib      [C#]              Common/WPF
WPF User Control Library                          wpfusercontrollib        [C#]              Common/WPF
Windows Forms (WinForms) Application              winforms                 [C#]              Common/WinForms
Windows Forms (WinForms) Class library            winformslib              [C#]              Common/WinForms
Worker Service                                    worker                   [C#]              Common/Worker/Web
Unit Test Project                                 mstest                   [C#], F#, VB      Test/MSTest
NUnit 3 Test Project                              nunit                    [C#], F#, VB      Test/NUnit
NUnit 3 Test Item                                 nunit-test               [C#], F#, VB      Test/NUnit
xUnit Test Project                                xunit                    [C#], F#, VB      Test/xUnit
Razor Component                                   razorcomponent           [C#]              Web/ASP.NET
Razor Page                                        page                     [C#]              Web/ASP.NET
MVC ViewImports                                   viewimports              [C#]              Web/ASP.NET
MVC ViewStart                                     viewstart                [C#]              Web/ASP.NET
Blazor Server App                                 blazorserver             [C#]              Web/Blazor
Blazor WebAssembly App                            blazorwasm               [C#]              Web/Blazor/WebAssembly
ASP.NET Core Empty                                web                      [C#], F#          Web/Empty
ASP.NET Core Web App (Model-View-Controller)      mvc                      [C#], F#          Web/MVC
ASP.NET Core Web App                              webapp                   [C#]              Web/MVC/Razor Pages
ASP.NET Core with Angular                         angular                  [C#]              Web/MVC/SPA
ASP.NET Core with React.js                        react                    [C#]              Web/MVC/SPA
ASP.NET Core with React.js and Redux              reactredux               [C#]              Web/MVC/SPA
Razor Class Library                               razorclasslib            [C#]              Web/Razor/Library/Razor Class Library
```

This is a list of all the templates that you currently have installed.  We want to add our own templates to this list.

To do so navigate to the `working` directory and run the following:

```
dotnet new -i .\
```

This will install and templates found in the current directory.  After which run `dotnet new` again from the terminal and you should see the command in the list:

```
Templates                                         Short Name               Language          Tags
----------------------------------------------------------------------------------------------------------------------------------
Clean Architecture CQRS Command                   ca-command               [C#]              Common/Code/CQRS
```

### Using the Template
Now that our template is installed we can run the following command to execute it.

First navigate to `test` and create a `Pet` directory.  From within the `Pet` directory run the following:

```
dotnet new ca-command --name CreatePet --solutionName PetStore
```

You will see the following message:

```
The template "Clean Architecture CQRS Command" was created successfully.
```

And in your solution you will see the following files as expected:

![Code after executing command](./after-command-execution.png)

### Uninstalling

Because the template was installed from a local directory, we need to uninstall using the full path.  You can check what this was by running the following:

```
dotnet new -u
```

This will show you all installed templates.  Our custom template will be at the bottom of the list.  We can grab the path and run:

```
dotnet new -u [PATH]
```

## Publishing to Nuget
We've seen how to install a template locally, which works fine when using the template for yourself.  However, if you want to share this with other developers it can be easier to package up the template into a single nuget file that can be shared or uploaded to a nuget server.

### Packaging
The best way to do this is create another console app and then edit the project file to add the nuget package meta data.

From the `working` directory run:

```
dotnet new console templatepack
```

Now edit `templatepack.csproj` as follows:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <PackageType>Template</PackageType>
    <PackageVersion>1.0.1</PackageVersion>
    <PackageId>CleanArchitecture.CQRS.Templates</PackageId>
    <Title>Clean Architecture CQRS Templates</Title>
    <Authors>Daniel Mackay</Authors>
    <Description>Templates to use when creating Clean Architecture CQRS queries and commands</Description>
    <PackageTags>dotnet-new;templates;clean-architecture;cqrs</PackageTags>

    <TargetFramework>netstandard2.0</TargetFramework>

    <IncludeContentInPack>true</IncludeContentInPack>
    <IncludeBuildOutput>false</IncludeBuildOutput>
    <ContentTargetFolders>content</ContentTargetFolders>
    <RepositoryType>Github</RepositoryType>
    <RepositoryUrl>https://github.com/danielmackay/Clean-Architecture-CQRS-Templates</RepositoryUrl>
    <PackageProjectUrl>https://github.com/danielmackay/Clean-Architecture-CQRS-Templates</PackageProjectUrl>
    <Version>1.0.1</Version>
  </PropertyGroup>

  <ItemGroup>
    <Content Include="templates\**\*" Exclude="templates\**\bin\**;templates\**\obj\**" />
    <Compile Remove="**\*" />
  </ItemGroup>

</Project>
```

The important fields here are:
- `PackageId`: This is the ID used to install and uninstall your package
- `TargetFramework`: By using .NET Standard, we ensure this can be used by almost any .NET Runtime
- `IncludeContentInPack`: This ensures we include our source files in the template
- `IncludeBuildOutput`: This ensures we exclude the binaries produced by the project as they do nothing useful
- `ItemGroup` - This helps to define what is content and what should be compiled

Now that we have our nuget package defined we can navigate to the `working` directory and package it via the following:

```
dotnet pack
```

### Publising
Our nuget package can now be shared and installed via the `dotnet new -i` command by passing in the full path to the package.

If you want to go the extra mile, you can also publish this to a nuget server.  This can be done from the `working` directory by:

```
dotnet nuget push .\bin\Release\CleanArchitecture.CQRS.Templates.1.0.0.nupkg -k [APIKEY] -s https://api.nuget.org/v3/index.json
```

Where **[APIKEY]** is the private key to your nuget account.

Now there is no need to share the nuget package directly, and developers can install your package simply with:

```
dotnet new -i CleanArchitecture.CQRS.Templates
```

## Clean Architecture CQRS Templates
You have now seen the process involved in creating a dotnet template.  If you are solely interested in installing and using the `CleanArchitecture.CQRS.Templates` this can be done as follows:

### Install Official Nuget Package

```
dotnet new -i CleanArchitecture.CQRS.Templates
```

In the official nuget package `CleanArchitecture.CQRS.Templates` you can create commands and queries as follows.

### Creating a Command
Navigate to the top-level directory for the entity you are creating a command for. (e.g. Pets)

```
dotnet new ca-command --name CreatePet --solutionName MyApplication
```

This will create the following structure:

```
Pets (existing)
└───Commands
    ├───CreatePetCommand
    └───CreatePetCommandValidator
```

### Creating a Query
Navigate to the top-level directory for the entity you are creating a command for. (e.g. Pets)

```
dotnet new ca-query --name GetAllPets --solutionName MyApplication
```

This will create the following structure:

```
Pets (existing)
└───Queries
    └───GetAllPetsQuery
```

## Summary

In this article I have showed how custom dotnet templates can be used to reduce writing repetitive boiler plate code.  I applied this to the specific example of creating commands and queries in the Clean Architecture template (which is also a dotnet template).  

The examples above concentrate on the creating commands, but in the nuget package you will find templates for both commands and queries.  I have also shown how to install and use the official nuget package I created.  You can find out more about this on the [github repo](https://github.com/danielmackay/Clean-Architecture-CQRS-Templates) or on [nuget.org](https://www.nuget.org/packages/CleanArchitecture.CQRS.Templates/).

## Resources

### Clean Architecture
- [Clean Architecture - Jason Taylor](https://jasontaylor.dev/clean-architecture-getting-started)
- [Template Github Repo](https://github.com/danielmackay/Clean-Architecture-CQRS-Templates)

### dotnet cli tutorials
- [dotnet cli custom templates](https://docs.microsoft.com/en-us/dotnet/core/tools/custom-templates)
- [Creating templates with dotnet new](https://devblogs.microsoft.com/dotnet/how-to-create-your-own-templates-for-dotnet-new)
- [dotnet cli template tutorial](https://docs.microsoft.com/en-us/dotnet/core/tutorials/cli-templates-create-item-template)

### dotnet cli references
- [dotnet template samples](https://github.com/dotnet/dotnet-template-samples/tree/master)
- [dotnet templating wiki](https://github.com/dotnet/templating/wiki)
- [dotnet template.json reference](https://github.com/dotnet/templating/wiki/Reference-for-template.json)
