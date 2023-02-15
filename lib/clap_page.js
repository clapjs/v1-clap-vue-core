import clap from "./clap";
export default class clap_page extends clap{
    constructor(axios) {
        super(axios)
    }
    async getPageConfig(pageIdOrName){
        const PageConfig = await this.model('cdp_page').get({
            params: {
                filter: /^[a-fA-F0-9]{24}$/.test(pageIdOrName)?{_id: pageIdOrName}: {code: pageIdOrName},
                populate: 'idEntity'
            }
        }).then(res => res.records[0])
        const widgets = PageConfig._id ? await this.model('cdp_page_widget').get({params: {filter: {idPage: PageConfig._id},order:'order'}}).then(res => res.records) : [];
        PageConfig.listConfig.columns=JSON.parse(JSON.stringify(widgets)).filter(item=>!item.hasOwnProperty('listVisible')||item.listVisible===true).map(item=>{item.width=item.listWidth;return item});
        PageConfig.editConfig.columns=JSON.parse(JSON.stringify(widgets)).filter(item=>!item.hasOwnProperty('editVisible')||item.editVisible===true).map(item=>{item.width=item.editWidth;return item});
        return new Promise(function (resolve, reject) {
            resolve(PageConfig);
        });
    }
    async getPageCtrlFilter(pageCode,controlType,organ,group){
        controlType = controlType ? controlType : 'Organ'
        let filter = {}
        switch (controlType) {
            case 'Global':
                filter = {}
                break
            case 'Group':
                filter = pageCode === 'org_organ_refer' ? { _id: group } : { idOrgan: group }
                break
            case 'Organ':
                filter = pageCode === 'org_organ_refer' ? { _id: organ } : { idOrgan: organ }
                break
            case 'GroupAndOrgan':
                const organs = await this.model('org_organ').get({ params: { filter: { idGroupOrgan: group } } }).then(res => res.records)
                const organsFather = [group, ...clap_helper.getTreeParentNodesByArray(organs, organs.filter(item => item._id === organ)[0].p_id).split(',')]
                filter = pageCode === 'org_organ_refer' ? { $or: [{ _id: organ }, { _id: { $in: organsFather }, isShare: true }] } : { $or: [{ idOrgan: organ }, { idOrgan: { $in: organsFather }, isShare: true }] }
                break
            default:
                break
        }
        return filter;
    }
}