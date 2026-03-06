let eventBus = new Vue()

Vue.component('add-note-form', {
    template: `
        <form class="add-note-form" @submit.prevent="onSubmit">
            <div>
                <label for="title">Note Title:</label>
                <input id="title" v-model="title" required>
            </div>
            
            <div v-for="(item, index) in items" :key="index" class="item-row">
                <label :for="'item' + index">Item {{ index + 1 }}:</label>
                <div class="item-input-group">
                    <input 
                        :id="'item' + index" 
                        v-model="item.text" 
                        required
                    >
                    <button 
                        v-if="index >= 3" 
                        type="button" 
                        @click="removeItem(index)"
                        class="remove-btn"
                    >Delite</button>
                </div>
            </div>
            
            <div>
                <button 
                    type="button" 
                    @click="addItem" 
                    v-if="items.length < 5"
                    class="add-item-btn"
                >
                    Add Item
                </button>
            </div>
            
            <button type="submit">Create Note</button>
        </form>
    `,
    data() {
        return {
            title: null,
            items: [
                { text: null },
                { text: null },
                { text: null }
            ]
        }
    },
    methods: {
        addItem() {
            if (this.items.length < 5) {
                this.items.push({ text: null })
            }
        },
        removeItem(index) {
            if (index >= 3) {
                this.items.splice(index, 1)
            }
        },
        onSubmit() {
            let newNote = {
                title: this.title,
                items: this.items.map(item => ({
                    text: item.text,
                    completed: false
                }))
            }
            
            eventBus.$emit('note-created', newNote)
            
            this.title = null
            this.items = [
                { text: null },
                { text: null },
                { text: null }
            ]
        }
    }
})

Vue.component('note-card', {
    props: {
        note: {
            type: Object,
            required: true
        },
        isBlocked: {
            type: Boolean,
            default: false
        }
    },
    template: `
        <div class="note-card" :class="{ blocked: isBlocked }">
            <h3>{{ note.title }}</h3>
            <ul class="items-list">
                <li v-for="(item, index) in note.items" :key="index">
                    <label>
                        <input 
                            type="checkbox" 
                            :checked="item.completed"
                            @change="toggleItem(index)"
                            :disabled="item.completed || isBlocked"
                        >
                        {{ item.text }}
                    </label>
                </li>
            </ul>
            <div v-if="note.completedAt" class="completed-date">
                <p>Completed: {{ formatDate(note.completedAt) }}</p>
            </div>
        </div>
    `,
    methods: {
        toggleItem(index) {
            if (this.isBlocked) return
            this.$emit('item-toggled', {
                noteId: this.note.id,
                itemIndex: index
            })
        },
        formatDate(timestamp) {
            return new Date(timestamp).toLocaleString()
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
        },
        columnLimit: {
            type: Number,
            default: null
        }
    },
    template: `
        <div class="notes-container">
            <div v-if="isFull" class="column-message">
                <p>Column is full (max {{ columnLimit }} notes)</p> 
            </div>
            <div v-if="isColumnBlocked" class="column-message">
                <p>First column blocked - second column is full</p>
            </div>
            <note-card 
                v-for="note in filteredNotes" 
                :key="note.id"
                :note="note"
                :is-blocked="isColumnBlocked"
                @item-toggled="handleItemToggle"
            ></note-card>
        </div>
    `,
    computed: {
        filteredNotes() {
            return this.allNotes.filter(note => note.columnId === this.columnId)
        },
        isFull() {
            if (!this.columnLimit) return false
            return this.filteredNotes.length >= this.columnLimit
        },
        isColumnBlocked() {
            if (this.columnId !== 1) return false
            
            const column2Notes = this.allNotes.filter(n => n.columnId === 2).length
            
            if (column2Notes >= 5) {
                let hasProgressOver50 = false
                
                for (let i = 0; i < this.filteredNotes.length; i++) {
                    const note = this.filteredNotes[i]
                    const completed = note.items.filter(i => i.completed).length
                    const percent = (completed / note.items.length) * 100
                    if (percent > 50) {
                        hasProgressOver50 = true
                        break
                    }
                }
                
                return hasProgressOver50
            }
            return false
        }
    },
    methods: {
        checkAndMoveNote(note) {
            const completedCount = note.items.filter(item => item.completed).length
            const percent = (completedCount / note.items.length) * 100
            
            if (note.columnId === 1 && percent >= 50) {
                const column2Notes = this.allNotes.filter(n => n.columnId === 2).length
                if (column2Notes < 5) {
                    note.columnId = 2
                    this.$root.saveToLocalStorage()
                }
            }
            else if (note.columnId === 2 && percent === 100) {
                note.columnId = 3
                note.completedAt = Date.now()
                this.$root.saveToLocalStorage()
            }
        },
        
        handleItemToggle(event) {
            const note = this.allNotes.find(n => n.id === event.noteId)
            
            if (note) {
                note.items[event.itemIndex].completed = !note.items[event.itemIndex].completed
                this.checkAndMoveNote(note)
                this.$root.saveToLocalStorage()
            }
        }
    },
    watch: {
        allNotes: {
            deep: true,
            handler() {
                if (this.columnId === 1) {
                    for (let i = 0; i < this.filteredNotes.length; i++) {
                        const note = this.filteredNotes[i]
                        this.checkAndMoveNote(note)
                    }
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
            <notes :column-id="column.id" :all-notes="allNotes" :column-limit="column.limit"></notes>
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
    methods: {
        saveToLocalStorage() {
            localStorage.setItem('notes-app', JSON.stringify(this.allNotes))
        },
        
        loadFromLocalStorage() {
            const saved = localStorage.getItem('notes-app')
            if (saved) {
                this.allNotes = JSON.parse(saved)
            }
        }
    },
mounted() {
    this.loadFromLocalStorage()
    
    eventBus.$on('note-created', (newNote) => {
        const column1Notes = this.allNotes.filter(note => note.columnId === 1).length
        
        if (column1Notes >= 3) {
            return
        }
        
        this.allNotes.push({
            id: this.allNotes.length + 1,
            title: newNote.title,
            items: newNote.items,
            columnId: 1,
            completedAt: null
        })
        this.saveToLocalStorage()
    })
}
})