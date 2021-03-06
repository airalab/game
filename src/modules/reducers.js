import { reducer as forms } from 'vol4-form'
import app from './app/reducer';
import market from './market/reducer';
import marketLiability from './marketLiability/reducer';
import estimator from './estimator/reducer';
import token from './token/reducer';
import history from './history/reducer';

export {
  forms,
  app,
  market,
  marketLiability,
  estimator,
  token,
  history
};
