import {getRequest, postRequest} from '../../../middlewares/api/actions';
import {getAllCodelistToBeSynchronizedUrl, getShyncCodelistsUrl,} from '../../../constants/urls';

export const SYNC_CODELISTS_CODELISTS_TO_SYNC_READ = 'SYNC_CODELISTS_CODELISTS_TO_SYNC_READ';
export const SYNC_CODELISTS_CODELISTS_TO_SYNC_CHANGE = 'SYNC_CODELISTS_CODELISTS_TO_SYNC_CHANGE';
export const SYNC_CODELISTS_SYNC_CODELISTS_SUBMIT = 'SYNC_CODELISTS_SYNC_CODELISTS_SUBMIT';

export const readSyncCodelistCodelistToSyncList = () => getRequest(
  SYNC_CODELISTS_CODELISTS_TO_SYNC_READ,
  getAllCodelistToBeSynchronizedUrl()
);

export const changeSyncCodelistsCodelistsToSync = selectedCodelists => ({
  type: SYNC_CODELISTS_CODELISTS_TO_SYNC_CHANGE,
  selectedCodelists
});

export const submitSyncCodelistsSyncCodelists = (codelistsToSync, codelists) => {
  return (
    postRequest(
      SYNC_CODELISTS_SYNC_CODELISTS_SUBMIT,
      getShyncCodelistsUrl(),
      codelists.filter(codelist => codelistsToSync.includes(`${codelist.id}+${codelist.agency}+${codelist.version}`)),
      t => ({
        success: t('scenes.dataManager.syncCodelist.messages.sync.success')
      })
    )
  )
};
