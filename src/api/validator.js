import mongoose from 'mongoose'

export function isObjectId (value) {
  return mongoose.Types.ObjectId.isValid(value)
}

export function isCode (value) {
  return value >= 0 && value < 10000
}

export default {
  'engineId': {
    in: 'body',
    notEmpty: true,
    isObjectId: {
      errorMessage: 'EngineId is not a valid ObjectId'
    },
    errorMessage: 'EngineId is required.'
  },
  'options': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'options is required.'
  },
  'name': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'name is required.'
  },
  'password': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'password is required.'
  },
  'role': {
    in: 'body'
  },
  'nodeName': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'nodeName is required.'
  },
  'accountTransaction': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'accountTransaction is required.'
  },
  'ioJournalItem': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'ioJournalItem is required.'
  },
  'stocksItemList': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'stocksItemList is required.'
  },
  'biddingItem': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'biddingItem is required.'
  },
  'biddingStageChange': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'biddingStageChange is required.'
  },
  'marketJournalItem': {
    in: 'body',
    notEmpty: true,
    errorMessage: 'marketJournalItem is required.'
  }
}
