import mongoose from 'mongoose';
import User from './user';
import Incident from './incident'
import PollingUnit from './pollingUnit'
import Result from './result';



const models = { User, Incident, PollingUnit, Result}; 

export default models;
