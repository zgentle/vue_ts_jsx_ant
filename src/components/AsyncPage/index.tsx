
import { Vue, Component, Prop } from 'vue-property-decorator'
import Loading from './Loading'

@Component
export default class AsyncPage extends Vue {
  // 动态加入页面路径
  @Prop(Function) load!: Function;
  // 动画持续时长
  @Prop(Number) delay!: number;
  template: any = Loading;
  async mounted() {
    const Template = await this.load()
    setTimeout(() => {
      this.template = Template.default
    }, this.delay || 0)
  }
  render() {
    const Page = this.template
    return <Page />
  }
}
