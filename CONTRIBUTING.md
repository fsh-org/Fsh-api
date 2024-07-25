# Contributing
## Endpoints
To contribute an endpoint you create a file in the `apis` folder.\
There is a base in `base.ts` or if you alredy know how it works you may use `base_min.ts`.

> [!NOTE]
> The bases have a .ts extension so the automatic assigner skips it, your api should be a .js file.\
> To make it not visible set the category to `hidden`.

These files include a module.exports that will define the endpoint.\
You should include any necessary packages at the top of the file next to any functions but the main code should be present in the `execute` part of the module.exports.

### Responses
The response should return a json object/array via the `res.json` function:
```js
res.json({
  data: 'value'
})
```
This function will do the formating and turning it into a json compatible string.

> [!IMPORTANT]
> The json keys should be
> - Undercase
> - No spaces or - (use _ )
> - Short

### Errors
If theres an error like the user forgot to add a parameter you can use the res.error function:
```js
res.error('Error message', status_code) // Status code is optional (default: 400)
```
The error message should be easy to understand and short.\
For the status codes:
- User error: 400
- Server error: 500
- You may use any other code if it fits better.