import Promise from 'bluebird'
import { START_LOAD, MODULE, BALACE, APPROVE } from './actionTypes'
import hett from '../../utils/hett'
import { formatDecimals } from '../../utils/helper'
import { flashMessage } from '../app/actions'

export function module(info) {
  return {
    type: MODULE,
    payload: info
  }
}

export function startLoad(address) {
  return {
    type: START_LOAD,
    payload: address
  }
}

export function setBalance(info) {
  return {
    type: BALACE,
    payload: info
  }
}

export function setApprove(info) {
  return {
    type: APPROVE,
    payload: info
  }
}

export function loadBalance(address, to) {
  return (dispatch) => {
    dispatch(startLoad(address))
    hett.getContractByName('Token', address)
      .then(contract => (
        Promise.join(
          contract.call('balanceOf', [to]),
          contract.call('decimals'),
          (balance, decimals) => (
            {
              balance: formatDecimals(balance, decimals),
            }
          )
        )
      ))
      .then((info) => {
        dispatch(setBalance({
          address,
          to,
          balance: info.balance
        }))
      })
  }
}

export function loadApprove(address, to) {
  return (dispatch) => {
    dispatch(startLoad(address))
    hett.getContractByName('Token', address)
      .then(contract => (
        Promise.join(
          contract.call('allowance', [hett.web3h.coinbase(), to]),
          contract.call('decimals'),
          (allowance, decimals) => (
            {
              approve: formatDecimals(allowance, decimals)
            }
          )
        )
      ))
      .then((info) => {
        dispatch(setApprove({
          address,
          to,
          approve: info.approve
        }))
      })
  }
}

export function loadModule(address) {
  return (dispatch) => {
    dispatch(startLoad(address))
    hett.getContractByName('Token', address)
      .then(contract => (
        Promise.join(
          contract.call('name'),
          contract.call('symbol'),
          (...info) => (
            {
              name: info[0],
              symbol: info[1]
            }
          )
        )
      ))
      .then((info) => {
        dispatch(module({
          address,
          info
        }))
      })
  }
}

export function contractSend(abi, address, action, values) {
  return dispatch => (
    hett.getContractByName(abi, address)
      .then(contract => contract.send(action, values))
      .then((txId) => {
        dispatch(flashMessage('txId: ' + txId))
        return hett.watcher.addTx(txId)
      })
      .then((transaction) => {
        dispatch(flashMessage('blockNumber: ' + transaction.blockNumber))
        return transaction;
      })
      .catch((e) => {
        console.log(e);
        return Promise.reject();
      })
  )
}

export function send(address, action, data) {
  return (dispatch) => {
    dispatch(contractSend('Token', address, action, data))
  }
}
