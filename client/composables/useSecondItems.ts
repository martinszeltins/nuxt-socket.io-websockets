export const useSecondItems = () => {
    const { on, emit } = useWebsockets()

    on('chat', (data: any) => {
        console.log('[useSecondItems.ts] chat event received: ', data)
    })

    onMounted(() => {
        emit('chat', { message: '[useSecondItems.ts] Hello from AppItems (client)' })
    })
}
