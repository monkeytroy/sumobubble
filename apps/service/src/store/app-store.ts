import { IAskSource } from '@/src/models/askSource';
import { ICustomer } from '@/src/models/customer';
import { preview } from '@/src/lib/preview';
import { addNewSite, removeSite, saveSite } from '@/src/services/site';
import { getSourceDocuments } from '@/src/services/source';
import { toast } from 'react-toastify';
import { create } from 'zustand';
import _ from 'lodash';
import { ISitesSummary } from '@/src/services/types';
import { ISite, ISiteSections } from '@/src//models/site';

/**
 * Module only interface for props
 */
interface IAppState {
  sites: Array<ISitesSummary>;
  site: ISite | null;
  siteChanged: boolean;
  customer: ICustomer | null;
  askSources: IAskSource[];
  saving: boolean;

  setCustomer: (val: ICustomer) => void;
  setSites: (val: Array<ISitesSummary>) => void;
  addSite: (siteTitle: string) => void;
  removeSite: (siteId: string) => void;
  setSite: (val: ISite) => void;
  updateSite: (val: ISite) => void;
  setSiteChanged: (val: boolean) => void;
  enableSection: (val: boolean, section: string) => void;
  refreshAskSources: () => void;
}

/**
 * Primary store for client UI
 */
export const useAppStore = create<IAppState>((set, get) => ({
  sites: [],
  site: null,
  siteChanged: false,
  customer: null,
  askSources: [],
  saving: false,

  setSaving: (val: boolean) => set(() => ({ saving: val })),

  setCustomer: (val: ICustomer) => set(() => ({ customer: { ...val } })),

  setSites: (val: Array<ISitesSummary>) => set(() => ({ sites: [...val] })),

  setSiteChanged: (val: boolean) => set(() => ({ siteChanged: val })),

  addSite: async (siteTitle: string) => {
    // call the service.
    const newSiteRes = await addNewSite(siteTitle);

    // update store
    if (newSiteRes?.success && newSiteRes?.data) {
      set((state) => ({ sites: [...state.sites, { ...newSiteRes?.data }] }));

      toast.success('Created!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true
      });
    } else {
      toast.error('Ooops! New site was not created. ' + newSiteRes.message, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: true
      });
    }
  },

  removeSite: async (siteId: string) => {
    // call the service
    const removeSiteRes = await removeSite(siteId);

    // update the store
    if (removeSiteRes) {
      set((state) => ({ sites: [...state.sites.filter((val) => val._id !== siteId)] }));
    }
  },

  setSite: (site: ISite) => {
    // update the preview with the loaded config
    preview(site);
    // load the ask documents
    get().refreshAskSources();
    // put the site on the store.
    set(() => ({ site: { ...site } }));
  },

  updateSite: async (site: ISite) => {
    set(() => ({ saving: true }));
    const newSite = await saveSite(site);
    get().setSite(newSite);
    set(() => ({ saving: false }));
  },

  enableSection: async (val: boolean, sectionName: string) => {
    const site = get().site;

    if (site) {
      let selectedSection = site?.sections[sectionName as keyof ISiteSections];

      // enable or create section
      if (selectedSection) {
        selectedSection.enabled = val;
      } else {
        selectedSection = {
          enabled: val,
          content: '',
          props: {}
        };
      }

      site.sections[sectionName as keyof ISiteSections] = { ...selectedSection };

      // service
      const res = await saveSite(site);

      // back to state
      get().setSite(res);
    }
  },

  refreshAskSources: async () => {
    const site = get().site;
    if (site?._id) {
      const res = await getSourceDocuments(site?._id);
      if (res?.success) {
        const sources = res.data;
        set(() => ({ askSources: sources }));
      }
    }
  }
}));
