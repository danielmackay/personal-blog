---
title: Using Typescript Without Typescript
date: "2020-03-07"
description: "How to enable Typescript checking of Javascript files in VS Code with JSDoc"
---

I'm a big fan of Typescript.  I like to use it in all my projects where possible.  Typescript provides error reporting and type checking of your Javascript/Typescript code.  It also provides you with intellisense and safe refactoring in the form of *quick fixes*.  It's your first line of defence against erronious code.  Another benefit of Typescript is that it allows you to use the latest Javascript language features when writing your code, but the output is down-compiled to javascript that all browsers support.  Neat.

However, not all frontend projects are set up to use Typescript.  Wouldn't it be great to get the benefits of Typescript without forcing this on your entire project (and team) and without adding a new tool into your frontend build process?  With VS Code and JSDoc - you can!

*Update March 8 - removed excludes from tsconfig.json and jsconfig.json as these are covered by the defaults.  Added example of using type declaration files.  Added repo for source code.*

## Setup

### Option 1: VS Code - Global

The first option is the easiest and will enable Typescript to check all your Javascript files from a single global setting.  The following setting can be enabled in your VS Code user or workspace settings:

```json
"javascript.implicitProjectConfig.checkJs": true
```

Or if you're a UI guy:

![Enabling TS Checking of JS via VS Code](./vscode-settings.png)

### Option 2: jsconfig.json - Global
The next option to enable type checking globally is via a `jsconfig.json`.  If this file is present, it will override any settings you might have enabled in VS Code.

```json
{
  "compilerOptions": {
    "checkJs": true
  }
}
```

### Option 3: per file
The third option is to enable on a per-file basis.  This is done with a comment at the top of the file.

```js
// @ts-check
let itsAsEasyAs = 'abc';
itsAsEasyAs = 123; // Error: Type '123' is not assignable to type 'string'
```

Using the same technique, you may wish to disable Typescript for a single file if it has been enabled globally using options 1 or 2 above.  This can be done with the following comment:

```js
// @ts-nocheck
let easy = 'abc';
easy = 123; // no error
```

Or if you want typescript to ignore just a section of a file you can use:

```js
let easy = 'abc';
// @ts-ignore
easy = 123; // no error

```

## Adding Types with JsDoc
You've now seen how to enable Typescript in your Javascript files.  This will provide you with basic type checking. This can be enhanced with defining your types with JsDoc comments.

### Adding Types to Functions
 
You can start by simply defining what your function takes as input:

```jsdoc
/**
 * @param {number} shippingVal
 */
updateShipping(shippingVal) {
    ...
}
```

Your editor will then have Typescript powered intellisense:

![TS powered intellisense](./ts-intellisense-2.png)

This works great for simple types, but what if you want to define your own types?  This can be done by using `jsdoc>@typedef`.  I recommend placing these type definitions at the top off your file for ease of discovery:

```jsdoc
/**
* @typedef {Object} CreditNoteTaxResponseViewModel
* @property {number} feeAmount
* @property {number} inclGst
* @property {number} subTotal
* @property {number} total
*
* @typedef {Object} ApiResponse
* @property {string} status
* @property {string} message
* @property {CreditNoteTaxResponseViewModel} response
*/
```

And then used where necessary:

```jsdoc
	/**
	 * @param {CreditNoteTaxRequestViewModel} req
	 * @returns {Promise<ApiResponse>}
	 */
	createCreditNoteTaxApiCall(req) {
        ...
	}
```

Another option is to move these types to their own type declaration file.  e.g. `main.d.ts`

```ts
export interface ICreditNoteTaxRequestViewModel{
    orderID: number;
    shippingCredit: number;
    lines: IICreditNoteTaxLineViewModel[]
}

export interface ICreditNoteTaxLineViewModel{
    originalOrderLineID:number;
    creditQuantity: number;
}

export interface ICreditNoteTaxResponseViewModel{
    feeAmount: number;
    inclGst: number;
    subTotal: number;
    total: number;
}

export interface IApiResponse{
    status: string;
    status: message;
    response: ICreditNoteTaxResponseViewModel;
}
```

These types can then be referenced in your Javascript as follows:

```jsdoc
  /**
   * @param {import("./main").ICreditNoteTaxRequestViewModel} req
   * @returns {Promise<import("./main").IApiResponse>}
   */
  function createCreditNoteTaxApiCall(req) {
    /// snip
    return;
  }
```

### Adding Types to inline code
The above solves the problem of adding types to function inputs and outputs.  We can do something similar with inline JsDoc comments:

![Inline JsDoc Comments](./ts-intellisense-inline.png)


### Adding Types to Libraries
VS Code has automatic type acquisition for 3rd party libraries.  This will be applied to any packages in your `packages.json` file.  However, if you prefer this to be explicit, you can configure this in `jsconfig.json`.

```json
{
  "typeAcquisition": {
    "include": ["jquery"]
  }
}
```

Once the type acquisition has picked up the library you can then use it with JsDoc:

```jsdoc
/**
 * @param {JQuery<HTMLElement>} $itemRow
 */
initRow($itemRow) {
    ...
}
```

## Migrating to Typescript
If you decide to start migrating from a Javascript project with some Typescript, to a full Typescript project, you can simply rename your `jsconfig.json` to `tsconfig.json` and add `allowJs: true`.

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  }
}
```

Once Typescript is enabled in your project, you can start renaming your `*.js` files to `*.ts` files one at a time and adding the types.  This can be a gradual migration process that happens over time.

## Summary
In this article, you've seen how easy it is to get some of the benefits of Typescript in a Javascript project with only the help of VS Code.  This approach allows you to keep your current build process exactly as is to avoid disruption and without having to convince your team to go all in.

Later on, if you decide you want to invest more into using Typescript, it is easy to convert to full Typescript and start converting your Javascript files to Typescript files.

## Code
The code for this article can be found on [Git Hub](https://github.com/danielmackay/using-typescript-without-typescript)


## Resources
- [Working with Javascript in VS Code](https://code.visualstudio.com/docs/nodejs/working-with-Javascript)
- [Javascript Typechekcing in VS Code](https://code.visualstudio.com/Docs/languages/Javascript#_type-checking)
- [Migrating from Javascript](https://www.Typescriptlang.org/docs/handbook/migrating-from-Javascript.html)
- [tsconfig documentation](https://www.Typescriptlang.org/docs/handbook/tsconfig-json.html)
- [JSDoc Documentation](https://jsdoc.app/)
- [JSDoc Cheatsheet](https://devhints.io/jsdoc)

