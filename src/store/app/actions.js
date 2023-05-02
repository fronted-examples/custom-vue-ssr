import {
  TOGGLE_SIDEBAR,
  CLOSE_SIDEBAR,
  UPDATE_DEFAULT_OPEN,
  RESET_DEFAULT_OPEN
} from './constant'

const actions = {
  [TOGGLE_SIDEBAR]: (context) => {
    context.commit(TOGGLE_SIDEBAR)
  },

  [CLOSE_SIDEBAR]: (context, { withoutAnimation }) => {
    context.commit(CLOSE_SIDEBAR, withoutAnimation)
  },

  [UPDATE_DEFAULT_OPEN]: (context, defaultOpen) => {
    context.commit(UPDATE_DEFAULT_OPEN, defaultOpen)
  },

  [RESET_DEFAULT_OPEN]: (context) => {
    context.commit(RESET_DEFAULT_OPEN)
  }

}

export default actions
