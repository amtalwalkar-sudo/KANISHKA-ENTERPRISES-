import {createViewModels} from './view-models/viewModels.js';
import {workRepository} from '../infrastructure/repositories/workRepository.js';
export function installRuntimeContract(){
 const viewModels=createViewModels();
 const runtime={viewModels,repository:workRepository,actions:{}};
 window.__KFE_RUNTIME__=runtime;
 window.KFE_VIEW_MODELS=viewModels;
 return runtime;
}
