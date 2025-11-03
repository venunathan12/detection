# detection

A Node.js module for JSON Schema Validation and Detection

## Usage

After installing this module by running the following in your terminal:
```
npm install @venunathan12/detection
```

You can run the following from any directory in your module:
```
npx detection <datajsonpath> <typename> <typespath>
``` 

This will make an attempt to match the json content in the file at path &lt;datajsonpath&gt;
<br>with the type named &lt;typename&gt; as defined inside the file at path &lt;typespath&gt;

## Examples

To run the examples, first clone this module's repository and enter the repository.
```
git clone https://github.com/venunathan12/detection
cd detection
```
Install this module.
```
npm install @venunathan12/detection
```
Navigate to one of examples.
```
cd ./examples/0001_ListOfRestaurants/
```
<br>All of the types required for the validation are defined in types.json.
<br>All other JSON files are examples, and their names contain the name of the type they are meant to be compared with and whether they are expected to match the mentioned type.
<br>For instance, `0001-ListOfRestaurants-T4.json` should be compared with type `ListOfRestaurants` and is an exmple of the data matching the type.
<br>And `0001-ListOfRestaurants-F4.json` is an exmple of the data not matching the type `ListOfRestaurants`.

Run the example `0001-ListOfRestaurants-T4.json` and verify that it matches type `ListOfRestaurants`.
```
npx detection 0001-ListOfRestaurants-T4.json ListOfRestaurants types.json
```
Your output should show that the match was successful.
```
T


Info: 0


Warnings: 0


Errors: 0
```

<br>Run the example `0001-ListOfRestaurants-F4.json` and verify that it doesn't match type `ListOfRestaurants`.
```
npx detection 0001-ListOfRestaurants-F4.json ListOfRestaurants types.json
```
Your output should show that the match was unsuccessful.
<br>The output also shows you why the match was unsuccessful.
```
F


Info: 6

Data: "indian" with Identifier: "indian" has an identifier which was seen previously for Data: "indian" in this Set.

Data: ["indian","indian"] does not match Type Set !

Data: {"id":1001,"name":"Hotel CStar","cuisines":["indian","indian"],"address":"Shop S2, Road R2,\nCity C2"} does not match Type Structure !

Data: {"id":1001,"name":"Hotel CStar","cuisines":["indian","indian"],"address":"Shop S2, Road R2,\nCity C2"} does not match Type Restaurant !

Data: [{"id":1001,"name":"Hotel CStar","cuisines":["indian","indian"],"address":"Shop S2, Road R2,\nCity C2"}] does not match Type List !

Data: [{"id":1001,"name":"Hotel CStar","cuisines":["indian","indian"],"address":"Shop S2, Road R2,\nCity C2"}] does not match Type ListOfRestaurants !


Warnings: 0


Errors: 0
```
