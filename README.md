# auto-post

## Default config

```js
const defaultConfig = {
    // 网站的URL
    url: '',

    // 显示文章列表的数量
    limit: 3,

    // 设置超时时间, 默认10s
    timeout: 10000,

    // 如果是异步，触发loadEventFired后，监听该DOM树，范围小提高性能，默认为body
    observer_selector: 'body',

    // 文章列表标题、描述的selector
    title_selector: 'null',
    desc_selector: 'null',

    // 会取该元素的href
    link_selector: 'null' 
}
```
