type OnEventProxy<EventMap extends Record<string, any>> = {
   readonly [K in keyof EventMap]: (callback: (ev: EventMap[K]) => void) => void
}

type OffEventProxy<EventMap extends Record<string, any>> = {
   readonly [K in keyof EventMap]: (callback: (ev: EventMap[K]) => void) => void
}

type OnceEventProxy<EventMap extends Record<string, any>> = {
   readonly [K in keyof EventMap]: (callback: (ev: EventMap[K]) => void) => void
}

type ListenProxy<EventMap extends Record<string, any>> = {
   (callback: (ev: EventMap[keyof EventMap]) => void): void
}

/**
 * Abstract base class for event listeners.
 * Provides a typed event emitter pattern with start/stop lifecycle management.
 * Supports fluent property-based API with function call syntax.
 *
 * @template EventMap - Record mapping event names to their payload types
 * 
 * @example
 * // Fluent API - Function call (recommended)
 * listener.on.eventname((ev) => console.log(ev))
 * listener.off.eventname(callback)
 * listener.once.eventname((ev) => console.log(ev))
 */
export abstract class ListenerBase<EventMap extends Record<string, any>> {
   protected listeners = new Map<keyof EventMap, Set<(ev: any) => void>>()
   /** Whether the listener is currently running */
   public isRunning = false
   private startPromise: Promise<void> | null = null
   private _onProxy: OnEventProxy<EventMap> | null = null
   private _offProxy: OffEventProxy<EventMap> | null = null
   private _onceProxy: OnceEventProxy<EventMap> | null = null
   private _listenProxy: ListenProxy<EventMap> | null = null

   /**
    * Fluent API for registering event handlers.
    * @example listener.on.down((ev) => console.log(ev))
    */
   get on(): OnEventProxy<EventMap> {
      if (!this._onProxy) {
         this._onProxy = new Proxy({} as OnEventProxy<EventMap>, {
            get: (_, eventName: string) => {
               return (callback: (ev: any) => void) => {
                  this._on(eventName as keyof EventMap, callback)
               }
            }
         })
      }
      return this._onProxy
   }

   /**
    * Fluent API for removing event handlers.
    * @example listener.off.down(callback)
    */
   get off(): OffEventProxy<EventMap> {
      if (!this._offProxy) {
         this._offProxy = new Proxy({} as OffEventProxy<EventMap>, {
            get: (_, eventName: string) => {
               return (callback: (ev: any) => void) => {
                  this._off(eventName as keyof EventMap, callback)
               }
            }
         })
      }
      return this._offProxy
   }

   /**
    * Fluent API for registering one-time event handlers.
    * @example listener.once.down((ev) => console.log(ev))
    */
   get once(): OnceEventProxy<EventMap> {
      if (!this._onceProxy) {
         this._onceProxy = new Proxy({} as OnceEventProxy<EventMap>, {
            get: (_, eventName: string) => {
               return (callback: (ev: any) => void) => {
                  this._once(eventName as keyof EventMap, callback)
               }
            }
         })
      }
      return this._onceProxy
   }

   /**
    * Register a general event handler that receives all events.
    * @example listener.listen((ev) => console.log(ev.event, ev))
    */
   get listen(): ListenProxy<EventMap> {
      if (!this._listenProxy) {
         this._listenProxy = ((callback: (ev: EventMap[keyof EventMap]) => void) => {
            this._on('*' as keyof EventMap, callback)
         }) as ListenProxy<EventMap>
      }
      return this._listenProxy
   }

   /**
    * Remove a general event handler.
    * @example listener.unlisten(callback)
    */
   unlisten(callback: (ev: EventMap[keyof EventMap]) => void) {
      this._off('*' as keyof EventMap, callback)
   }

   /**
    * Internal method to register an event handler.
    */
   private _on<K extends keyof EventMap>(event: K, cb: (ev: EventMap[K]) => void) {
      if (!this.listeners.has(event)) {
         this.listeners.set(event, new Set())
      }
      this.listeners.get(event)!.add(cb as (ev: any) => void)
   }

   /**
    * Internal method to remove an event handler.
    */
   private _off<K extends keyof EventMap>(event: K, cb: (ev: EventMap[K]) => void) {
      this.listeners.get(event)?.delete(cb as (ev: any) => void)
   }

   /**
    * Internal method to register a one-time event handler.
    */
   private _once<K extends keyof EventMap>(event: K, cb: (ev: EventMap[K]) => void) {
      const wrapper = (ev: EventMap[K]) => {
         try {
            cb(ev)
         } finally {
            this._off(event, wrapper)
         }
      }
      this._on(event, wrapper)
   }

   /**
    * Start the listener loop (non-blocking, runs in background).
    * @param interval - Polling interval in milliseconds (default: 8)
    * @returns Promise that resolves when listener stops
    */
   async start(interval = 8): Promise<void> {
      if (this.isRunning) {
         console.warn('Listener already running')
         return this.startPromise ?? Promise.resolve()
      }

      this.isRunning = true
      this.startPromise = (async () => {
         try {
            await this.run(interval)
         } catch (err) {
            console.error('Listener run error:', err)
         } finally {
            this.isRunning = false
            this.startPromise = null
         }
      })()

      return this.startPromise
   }

   /**
    * Stop the listener loop.
    * @returns Promise that resolves when listener has fully stopped
    */
   async stop(): Promise<void> {
      this.isRunning = false
      if (this.startPromise) {
         await this.startPromise
      }
   }

   protected _emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
      this.listeners.get(event)?.forEach((fn) => {
         try {
            fn(data)
         } catch (err) {
            console.error(`Listener error [${String(event)}]:`, err)
         }
      })
      this.listeners.get('*' as keyof EventMap)?.forEach((fn) => {
         try {
            fn(data)
         } catch (err) {
            console.error(`Listener error [*]:`, err)
         }
      })
   }

   protected abstract run(interval: number): Promise<void>
}

