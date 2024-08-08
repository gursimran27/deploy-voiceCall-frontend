import { createSlice } from '@reduxjs/toolkit'
import { MENU_ITEMS } from '@/constants'

const initialState = {
    activeMenuItem: MENU_ITEMS.PENCIL,
    actionMenuItem: null,
    openPaint: false,
}

export const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        menuItemClick: (state, action) => {
            state.activeMenuItem = action.payload
        },
        actionItemClick: (state, action) => {
            state.actionMenuItem = action.payload
        },
        toggleOpenpaint: (state, action) => {
            state.openPaint = action.payload.open
        }
    }
})

export const {menuItemClick, actionItemClick, toggleOpenpaint } = menuSlice.actions

export default menuSlice.reducer