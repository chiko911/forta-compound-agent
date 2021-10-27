"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var axios_1 = __importDefault(require("axios"));
var forta_agent_1 = require("forta-agent");
var currentUtilizationRate;
var previousUtilizationRate;
// Getting data from USDC pool
function axiosTest() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, axios_1.default.get('https://api.compound.finance/api/v2/ctoken?addresses=0x39aa39c021dfbae8fac545936693ac917d5e7563', {
                    headers: {
                        'Content-type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
                    .then(function (response) { return response.data.cToken[0]; })];
        });
    });
}
var handleTransaction = function (txEvent) { return __awaiter(void 0, void 0, void 0, function () {
    var findings, cTokenData, total_supply, total_borrows, reserves, cTokenExchangeRate, currentUtilizationRate, differenceRate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                findings = [];
                return [4 /*yield*/, axiosTest()];
            case 1:
                cTokenData = _a.sent();
                total_supply = new bignumber_js_1.default(cTokenData.total_supply.value);
                total_borrows = new bignumber_js_1.default(cTokenData.total_borrows.value);
                reserves = new bignumber_js_1.default(cTokenData.reserves.value);
                cTokenExchangeRate = new bignumber_js_1.default(cTokenData.exchange_rate.value);
                currentUtilizationRate = new bignumber_js_1.default(total_borrows.dividedBy(total_supply.multipliedBy(cTokenExchangeRate).plus(total_borrows).minus(reserves)));
                if (bignumber_js_1.default.isBigNumber(previousUtilizationRate)) {
                    console.log('Basic UR is ' + previousUtilizationRate);
                    console.log('Current UR is ' + currentUtilizationRate);
                    differenceRate = new bignumber_js_1.default(previousUtilizationRate.minus(currentUtilizationRate).dividedBy(previousUtilizationRate).multipliedBy(1000));
                    if (differenceRate.isNegative())
                        differenceRate = new bignumber_js_1.default(differenceRate).multipliedBy(-1);
                    if (differenceRate.isGreaterThanOrEqualTo(10)) {
                        findings.push(forta_agent_1.Finding.fromObject({
                            name: "Utilization rate alert for UDSC pool",
                            description: "Utilization rate has changed more than 10% from " + previousUtilizationRate.decimalPlaces(4) + " to " + currentUtilizationRate.decimalPlaces(4),
                            alertId: "COMPOUND-1",
                            severity: forta_agent_1.FindingSeverity.High,
                            type: forta_agent_1.FindingType.Suspicious,
                            metadata: {
                                previousUtilizationRateData: previousUtilizationRate.toString(),
                                currentUtilizationRateData: currentUtilizationRate.toString(),
                                utilizationRateDifferenceData: differenceRate.toString()
                            }
                        }));
                        return [2 /*return*/, findings];
                    }
                    console.log('Diff: ' + differenceRate);
                    previousUtilizationRate = new bignumber_js_1.default(currentUtilizationRate);
                }
                else {
                    previousUtilizationRate = new bignumber_js_1.default(currentUtilizationRate);
                    console.log('Basic UR is ' + previousUtilizationRate);
                }
                // waiting for 60 minutes
                return [4 /*yield*/, new Promise(function (f) { return setTimeout(f, 120000); })];
            case 2:
                // waiting for 60 minutes
                _a.sent();
                //await new Promise(f => setTimeout(f, 3600000));
                return [2 /*return*/, findings];
        }
    });
}); };
exports.default = {
    handleTransaction: handleTransaction,
};
