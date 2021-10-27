import BigNumber from 'bignumber.js'
import axios from 'axios'
import {
  BlockEvent,
  Finding,
  HandleBlock,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType
} from 'forta-agent'

var currentUtilizationRate: BigNumber
var previousUtilizationRate: {}

// Getting data from USDC pool

async function axiosTest() {
    return axios.get('https://api.compound.finance/api/v2/ctoken?addresses=0x39aa39c021dfbae8fac545936693ac917d5e7563', {
    headers: {
        'Content-type':'application/json',
        'Accept':'application/json'
      }
    })
    .then(response => response.data.cToken[0])
}

const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
const findings: Finding[] = []

var cTokenData = await axiosTest()
var total_supply = new BigNumber(cTokenData.total_supply.value)
var total_borrows = new BigNumber(cTokenData.total_borrows.value)
var reserves = new BigNumber(cTokenData.reserves.value)
var cTokenExchangeRate = new BigNumber(cTokenData.exchange_rate.value)
var currentUtilizationRate = new BigNumber(total_borrows.dividedBy(total_supply.multipliedBy(cTokenExchangeRate).plus(total_borrows).minus(reserves)))

  if(BigNumber.isBigNumber(previousUtilizationRate)) {
    console.log('Basic UR is ' + previousUtilizationRate)
    console.log('Current UR is ' + currentUtilizationRate)

    var differenceRate = new BigNumber(previousUtilizationRate.minus(currentUtilizationRate).dividedBy(previousUtilizationRate).multipliedBy(1000))
    if(differenceRate.isNegative()) differenceRate = new BigNumber(differenceRate).multipliedBy(-1)
    if(differenceRate.isGreaterThanOrEqualTo(10)) {

    findings.push(Finding.fromObject({
      name: "Utilization rate alert for UDSC pool",
      description: `Utilization rate has changed more than 10% from ${previousUtilizationRate.decimalPlaces(4)} to ${currentUtilizationRate.decimalPlaces(4)}`,
      alertId: "COMPOUND-1",
      severity: FindingSeverity.High,
      type: FindingType.Suspicious,
      metadata: {
        previousUtilizationRateData: previousUtilizationRate.toString(),
        currentUtilizationRateData: currentUtilizationRate.toString(),
        utilizationRateDifferenceData: differenceRate.toString()
      }
    }))

    return findings
  }

  console.log('Diff: ' + differenceRate)
  previousUtilizationRate = new BigNumber(currentUtilizationRate)
  }

  else {
    previousUtilizationRate = new BigNumber(currentUtilizationRate)
    console.log('Basic UR is ' + previousUtilizationRate)
  }

  // waiting for 60 minutes
  await new Promise(f => setTimeout(f, 120000));
  //await new Promise(f => setTimeout(f, 3600000));

  return findings
}

export default {
  handleTransaction,
}
