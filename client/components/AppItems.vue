<template>
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
</template>

<script setup lang="ts">
    const { on, emit } = useWebsockets()
    useFirstItems()
    useSecondItems()

    on('chat', (data: any) => {
        console.log('[AppItems.vue] chat event received: ', data)
    })

    onMounted(() => {
        emit('chat', { message: '[AppItems.vue] Hello from AppItems (client)' })
    })
</script>
