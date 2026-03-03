let eventBus = new Vue()

Vue.component('add-note-form', {
    template: `
        <form class="add-note-form" @submit.prevent="onSubmit">
            <div>
                <label for="title">Note Title:</label>
                <input id="title" v-model="title" placeholder="title">
            </div>
            
            <div>
                <label for="item1">Item 1:</label>
                <input id="item1" v-model="item1" placeholder="item 1">
            </div>
            
            <div>
                <label for="item2">Item 2:</label>
                <input id="item2" v-model="item2" placeholder="item 2">
            </div>
            
            <div>
                <label for="item3">Item 3:</label>
                <input id="item3" v-model="item3" placeholder="item 3">
            </div>
            
            <button type="submit">Create Note</button>
        </form>
    `,
    data() {
        return {
            title: null,
            item1: null,
            item2: null,
            item3: null
        }
    },
    methods: {
        onSubmit() {
            let newNote = {
                title: this.title,
                items: [
                    { text: this.item1, completed: false },
                    { text: this.item2, completed: false },
                    { text: this.item3, completed: false }
                ]
            }
            
            eventBus.$emit('note-created', newNote)
            
            this.title = null
            this.item1 = null
            this.item2 = null
            this.item3 = null
        }
    }
})

Vue.component('note-card', {
    props: {
        note: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="note-card">
            <h3>{{ note.title }}</h3>
            <ul>
                <li v-for="item in note.items">{{ item.text }}</li>
            </ul>
        </div>
    `
})

Vue.component('notes', {
    props: {
        columnId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            notes: []
        }
    },
    template: `
        <div class="notes-container">
            <note-card 
                v-for="note in filteredNotes" 
                :key="note.id"
                :note="note"
            ></note-card>
        </div>
    `,
    computed: {
        filteredNotes() {
            return this.notes.filter(note => note.columnId === this.columnId)
        }
    },
    mounted() {
        eventBus.$on('note-created', (newNote) => {
            this.notes.push({
                id: this.notes.length + 1,
                title: newNote.title,
                items: newNote.items,
                columnId: 1
            })
        })
    }
})

Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <notes :column-id="column.id"></notes>
        </div>
    `
})

let app = new Vue({
    el: '#app',
    data: {
        columns: [
            { id: 1, title: 'To Do (max 3)', limit: 3 },
            { id: 2, title: 'In Progress (max 5)', limit: 5 },
            { id: 3, title: 'Done (unlimited)', limit: null }
        ]
    }
})