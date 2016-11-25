import { defineComponent, mount, createElement as htm } from 'js-surface';
import Publisher from '../internal/src/main/util/Publisher.js';



const Counter = defineComponent({
    name: 'Counter',
    
    properties: {
        user: {
            type: value => typeof value === 'string',
            defaultValue: 'John Doe'
        }
    },
    
    initialize(inputs) {
        const viewsPublisher = new Publisher(subscriber => {
            var n = 0;
            
            const send = () =>{
                subscriber.next(htm('div', null, ++n));
            };
            
            send();
            
            const timeout = setInterval(() => {
                send();
            }, 1);
            
            return () => clearInterval(timeout);
        });

        return {
            views: viewsPublisher
        }
    }
});


mount(htm("div", null, Counter()), 'main-content');