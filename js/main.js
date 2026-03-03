let eventBus = new Vue()

Vue.component('add-note-form', {
    template: `
        <form class="add-note-form" @submit.prevent="onSubmit">
            <div>
                <label for="title">Note Title:</label>
                <input id="title" v-model="title" required>
            </div>
            
            <div>
                <label for="item1">Item 1:</label>
                <input id="item1" v-model="item1" required>
            </div>
            
            <div>
                <label for="item2">Item 2:</label>
                <input id="item2" v-model="item2" required>
            </div>
            
            <div>
                <label for="item3">Item 3:</label>
                <input id="item3" v-model="item3" required>
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
            <ul class="items-list">
                <li v-for="(item, index) in note.items" :key="index">
                    <label>
                        <input 
                            type="checkbox" 
                            :checked="item.completed"
                            @change="toggleItem(index)"
                        >
                        {{ item.text }}
                    </label>
                </li>
            </ul>
        </div>
    `,
    methods: {
        toggleItem(index) {
            this.$emit('item-toggled', {
                noteId: this.note.id,
                itemIndex: index
            })
        }
    }
})

Vue.component('notes', {
    props: {
        columnId: {
            type: Number,
            required: true
        },
        allNotes: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="notes-container">
            <note-card 
                v-for="note in filteredNotes" 
                :key="note.id"
                :note="note"
                @item-toggled="handleItemToggle"
            ></note-card>
        </div>
    `,
    computed: {
        filteredNotes() {
            return this.allNotes.filter(note => note.columnId === this.columnId)
        }
    },
    methods: {
        handleItemToggle(event) {
            const note = this.allNotes.find(n => n.id === event.noteId)
            
            if (note) {
                note.items[event.itemIndex].completed = !note.items[event.itemIndex].completed

                const completedCount = note.items.filter(item => item.completed).length
                const totalCount = note.items.length
                const percent = (completedCount / totalCount) * 100
                
                if (note.columnId === 1 && percent > 50) {
                    note.columnId = 2
                }
            }
        }
    }
})

Vue.component('column', {
    props: {
        column: {
            type: Object,
            required: true
        },
        allNotes: {
            type: Array,
            required: true
        }
    },
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <notes :column-id="column.id" :all-notes="allNotes"></notes>
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
        ],
        allNotes: []
    },
    mounted() {
        eventBus.$on('note-created', (newNote) => {
            this.allNotes.push({
                id: this.allNotes.length + 1,
                title: newNote.title,
                items: newNote.items,
                columnId: 1
            })
        })
    }
})