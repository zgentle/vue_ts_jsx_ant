import {Vue, Component, Prop, Watch, Emit} from 'vue-property-decorator';
import {Button} from 'ant-design-vue'
import Api from '@/utils/request'

@Component({
  components: {
    'a-button': Button
  }
})
export default class ApiManage extends Vue {
  msg: string = '';

  // 复制值
  private sendMsg() {
    Api.postTest({
      password: "91f0e9577f6a187cce2c901315542a86",
      username: "admin"
    }).then((res: any) => {
        this.msg = res.message
      })
  }

  protected render() {

    return <div>
      <a-button type="primary" onClick={this.sendMsg}>发个请求</a-button>
      <p>返回值:{this.msg}</p>
    </div>;

  }

}
