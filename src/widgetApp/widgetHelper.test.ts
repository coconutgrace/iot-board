import {assert} from "chai";
import helper from "./widgetHelper";


describe('Widget Helper', function () {
    describe('propertyByString', function () {
        it("Get some valid properties", function () {

            const obj = {
                array: [0, 1, 2, 3, 4, 5],
                string: "012345",
                number: 12345,
                nested: {
                    array: [0, 1, 2, 3, 4, 5],
                    string: "012345",
                    number: 12345,
                }
            };

            assert.deepEqual([0, 1, 2, 3, 4, 5], helper.propertyByString(obj, ".array"));
            assert.deepEqual("012345", helper.propertyByString(obj, "string"));
            assert.deepEqual(12345, helper.propertyByString(obj, "[number]"));
            assert.deepEqual([0, 1, 2, 3, 4, 5], helper.propertyByString(obj, "nested[array]"));
            assert.deepEqual(0, helper.propertyByString(obj, "nested[array][0]"));
            assert.deepEqual(1, helper.propertyByString(obj, "nested.array[1]"));
            assert.deepEqual(2, helper.propertyByString(obj, "nested.array.2"));
        });
    });
});

