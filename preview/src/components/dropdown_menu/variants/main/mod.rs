use super::super::component::{
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
};
use dioxus::prelude::*;
use dioxus_primitives::dialog::{DialogContent, DialogRoot, DialogTitle};
use strum::IntoEnumIterator;

#[css_module("/src/components/dropdown_menu/style.css")]
struct Styles;

#[derive(Clone, Copy, strum::Display, strum::EnumIter, PartialEq)]
enum Operation {
    Edit,
    Undo,
    Duplicate,
    Delete,
}

#[component]
pub fn Demo() -> Element {
    let mut selected_operation = use_signal(|| None);
    let mut parent_escape_count = use_signal(|| 0usize);
    let mut dialog_open = use_signal(|| false);
    let dialog_open_state: ReadSignal<Option<bool>> =
        use_memo(move || Some(dialog_open())).into();

    let operations = Operation::iter().enumerate().map(|(i, o)| {
        rsx! {
            DropdownMenuItem::<Operation> {
                class: Styles::dx_dropdown_menu_item,
                value: o,
                index: i,
                disabled: matches!(o, Operation::Undo),
                on_select: move |value| {
                    selected_operation.set(Some(value));
                },
                {o.to_string()}
            }
        }
    });

    rsx! {
        div {
            onkeydown: move |event: KeyboardEvent| {
                if event.key() == Key::Named(NamedKey::Escape) {
                    parent_escape_count.with_mut(|count| *count += 1);
                }
            },
            DropdownMenu {
                class: Styles::dx_dropdown_menu,
                default_open: false,
                DropdownMenuTrigger { class: Styles::dx_dropdown_menu_trigger, "Open Menu" }
                DropdownMenuContent { class: Styles::dx_dropdown_menu_content,
                    {operations}
                    DropdownMenuItem::<()> {
                        class: Styles::dx_dropdown_menu_item,
                        value: (),
                        index: Operation::iter().count(),
                        on_select: move |()| dialog_open.set(true),
                        "Show details"
                    }
                }
            }
            if let Some(op) = selected_operation() {
                "Selected: {op}"
            }
            div { "Parent Escapes: {parent_escape_count}" }
            DialogRoot {
                open: dialog_open_state,
                on_open_change: move |open| dialog_open.set(open),
                DialogContent {
                    DialogTitle { "Action details" }
                    button { onclick: move |_| dialog_open.set(false), "Close dialog" }
                }
            }
        }
    }
}
