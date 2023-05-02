<script>
export default {
  render (h) {
    const h1 = document.createElement('h1').innerText = 'hi'
    return h('div', h1)
  }
}
</script>
