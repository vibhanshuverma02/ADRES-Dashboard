// import node module libraries
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// import app config file
import { settings } from "app.config";

export type MenuToggleType = "expanded" | "collapsed";

interface initialStateType {
  skin: string;
  showMenu: boolean;
  collapsed: MenuToggleType;
}

const initialState: initialStateType = {
  skin: settings.theme.skin,
  showMenu: true,
  collapsed: "expanded",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    changeSkin: (state, action) => {
      state.skin = action.payload;
    },

    toggleMenu: (state, action: PayloadAction<{ showMenu: boolean }>) => {
      state.showMenu = action.payload.showMenu;
      state.collapsed = action.payload.showMenu ? "expanded" : "collapsed"; // 🔗 keep in sync
    },

    setCollapsed: (state, action: PayloadAction<{ value: MenuToggleType }>) => {
      const value = action.payload.value;

      // update HTML class for layout
      document.querySelector("html")?.setAttribute("class", value);

      // set collapsed + sync showMenu
      state.collapsed = value;
      state.showMenu = value === "expanded";
    },
  },
});

export const { changeSkin, toggleMenu, setCollapsed } = appSlice.actions;
export default appSlice.reducer;
