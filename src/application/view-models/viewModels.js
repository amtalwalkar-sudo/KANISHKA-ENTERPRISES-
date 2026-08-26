const names=['work','fuel','expenses','revenue','maintenance','loan','renewals'];
export function createViewModels(){return Object.fromEntries(names.map(name=>[name,{name,data:[]}]))}
