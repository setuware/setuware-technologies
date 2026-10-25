/**
 * Event name shared by the header trigger and the command menu.
 *
 * A window event rather than React context: the trigger lives in the header and
 * the dialog is lazily mounted elsewhere, and this keeps the dialog's bundle
 * out of the header's chunk.
 */
export const OPEN_COMMAND_EVENT = "setuware:open-command";
