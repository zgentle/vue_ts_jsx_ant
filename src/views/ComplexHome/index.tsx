import { AsyncPage } from '@/components'

export default () => <AsyncPage key="appManage" load={() => import('./appMange')} />
