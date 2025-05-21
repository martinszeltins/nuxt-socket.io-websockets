export const useFirstItems = () => {
    const { on, emit } = useWebsockets()

    on('chat', (data: any) => {
        console.log('[useFirstItems.ts] chat event received: ', data)
    })

    onMounted(() => {
        emit('chat', { message: '[useFirstItems.ts] Hello from AppItems (client)' })
    })
}
