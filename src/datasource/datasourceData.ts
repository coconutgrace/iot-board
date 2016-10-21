import * as ActionNames from "../actionNames";
import * as AppState from "../appState";
import {IPersistenceAction} from "../persistence";

interface IDatasourceDataAction extends AppState.Action, IPersistenceAction {
    id?: string
    data?: any[]
}

export interface IDatasourceDataState {
    [id: string]: any[]
}


export function fetchedDatasourceData(id: string, data: any[]): IDatasourceDataAction {
    return {
        type: ActionNames.FETCHED_DATASOURCE_DATA,
        id,
        data,
        doNotLog: true,
        doNotPersist: true
    }
}

export function clearData(id: string): IDatasourceDataAction {
    return {
        type: ActionNames.CLEAR_DATASOURCE_DATA,
        id
    }
}

export function datasourceData(state: IDatasourceDataState = {}, action: IDatasourceDataAction): IDatasourceDataState {
    switch (action.type) {
        case ActionNames.FETCHED_DATASOURCE_DATA:
            return _.assign({}, state, {
                [action.id]: action.data
            });
        case ActionNames.CLEAR_DATASOURCE_DATA: {
            const newState = _.assign({}, state);
            return _.assign({}, state, {
                [action.id]: []
            });
        }
        default:
            return state;
    }
}

