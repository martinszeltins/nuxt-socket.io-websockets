import { getCurrentInstance } from 'vue'
import { io, type Socket } from 'socket.io-client'

/**
 * Map used to track which listeners were registered by which component instance.
 * Allows us to auto-clean them up on unmount. Otherwise we would have problems when
 * a component registers some listeners and then unmounts and then mounts again. The
 * listeners would be registered again and we would have duplicates.
 */
const componentListeners = new WeakMap<object, Set<{ event: string, handler: (...args: unknown[]) => void }>>()

export const useWebsockets = () => {
    /**
     * We want to store the socket instance and connection globally, that is why
     * it is outside our composable. We should be able toc call useWebsockets() in
     * any component or any other composable and if it is not already connected, it
     * will connect otherwise it will use the existing connection.
     */
    const socket = useState<Socket | null>('websockets', () => null)
    const isConnected = useState('websockets-connected', () => false)
    const isConnecting = useState('websockets-connecting', () => false)
    const error = useState<string | null>('websockets-error', () => null)
    const isListenersRegistered = useState('websockets-listeners-registered', () => false)

    /**
     * It makes no sense to use websockets on the server side.
     */
    if (!import.meta.client) {
        return {
            on: () => {},
            off: () => {},
            emit: () => {},
            close: () => {},
            isConnected,
            isConnecting,
            error,
            socket
        }
    }

    /**
     * If we are not yet connected, then we create a new socket instance and connection.
     */
    if (!socket.value) {
        isConnecting.value = true

        socket.value = io('http://localhost:3600', {
            path: '/ws',
            transports: ['websocket', 'polling']
        })

        /**
         * Register core listeners once
         */
        if (socket.value && !isListenersRegistered.value) {
            socket.value.on('connect', () => {
                isConnected.value = true
                isConnecting.value = false
                error.value = null
            })

            socket.value.on('disconnect', () => {
                isConnected.value = false
                isConnecting.value = false
            })

            socket.value.on('connect_error', connectError => {
                isConnected.value = false
                isConnecting.value = false
                error.value = connectError?.message || 'Connection error'
            })

            isListenersRegistered.value = true
        }
    }

    const on = (event: string, handler: (...args: unknown[]) => void) => {
        if (!socket.value) return

        const instance = getCurrentInstance()
        if (!instance) throw new Error('useWebsockets() must be used inside setup()')

        socket.value.on(event, handler)

        if (!componentListeners.has(instance)) {
            componentListeners.set(instance, new Set())
            // Register automatic cleanup
            onUnmounted(() => {
                const listeners = componentListeners.get(instance)
                if (listeners) {
                    for (const { event, handler } of listeners) {
                        socket.value?.off(event, handler)
                    }
                    componentListeners.delete(instance)
                }
            })
        }

        componentListeners.get(instance)!.add({ event, handler })
    }

    const off = (event: string, handler: (...args: unknown[]) => void) => {
        socket.value?.off(event, handler)
    }

    const emit = (event: string, ...args: unknown[]) => {
        socket.value?.emit(event, ...args)
    }

    const close = () => {
        socket.value?.disconnect()
        socket.value = null
        isListenersRegistered.value = false
    }

    /**
     * The user can choose to use our own methods like on, emit, off etc.
     * Or they can simply grab the socket instance and use it directly.
     */
    return {
        on,
        off,
        emit,
        close,
        isConnected,
        isConnecting,
        error,
        socket
    }
}
