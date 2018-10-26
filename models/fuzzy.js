var fuzzylogic = require("fuzzylogic")
var assert = require("assert")
var rules = require("fuzzylogic/lib/rules")

var threatCalc = function(threat) {
    var bajo = fuzzylogic.trapezoid(threat, 0, 0, 10,18);
    var normal = fuzzylogic.trapezoid(threat, 15, 23, 31, 40);
    var anormal = fuzzylogic.trapezoid(threat, 35, 45, 55, 65);
    var excesiva = fuzzylogic.trapezoid(threat, 60, 80, 100, 100);

    // assert.ok(rules.and(10,25) == 10)
    // assert.ok(rules.and(25,55) == 30)
    // assert.ok(rules.and(45,75) == 65)
    // assert.ok(excesiva === 80)

    data = [bajo,normal,anormal,excesiva];
    percent = Math.max(...data);
    type = data.indexOf(percent);
    result = {
      result: (type * 25) + (25 * percent)
    }
    return result;

};

module.exports = {
  get_fuzzy:threatCalc
}
