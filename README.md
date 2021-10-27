# Utilization Rate Change Agent

## Description

This agent detects when Compound utilization rate changes for 10% or more within a 60 minute window in a USDC pool.

## Supported Chains

- Ethereum

## Alerts

Describe each of the type of alerts fired by this agent

- COMPOUND-1
  - Fired when an utilization rate changes for 10% or more within a 60 minute window in a USDC pool
  - Severity is always set to "high"
  - Type is always set to "suspicious"
  - Additional metadata:
    - previousUtilizationRateData: utilization rate 1 hour ago,
    - currentUtilizationRateData: current utilization rate,
    - utilizationRateDifferenceData: utilization change rate value
