<template>
    <h1>Nuxt Socket.io</h1>
    <AppItems v-if="showAppItems" />

    <div>
        <!-- Illustrate what happens when listeners are not removed on component unmount -->
        <button @click="showAppItems = !showAppItems">Toggle AppItems</button>
    </div>
</template>

<script setup lang="ts">
    const showAppItems = ref(true)
</script>
