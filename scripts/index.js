import { menuArray } from './data.js'

// Take control of elements.
const menuSection = document.getElementById('menu-section')
const paymentForm = document.getElementById('payment-form')
const orderDetailsSection = document.getElementById('order-details-section')
const modal = document.getElementById('modal')

// Set flags for if the 'pointer-cursor-hover' class was changed and if the 
// user placed an order and did not click the button to place a new order.
let isClassChanged = false;
let isOrderPlaced = false;

// Initialize orderDetails variable and render the menu items to the page.
let orderDetails = resetOrderDetails()
menuSection.innerHTML = getMenuItemsHtml()

// Function to get the HTML for all of the menu items.
function getMenuItemsHtml(){
    return menuArray.map(menuItem=>
        `
        <section class="menu-item">
            <div class="emoji-container">
                <i class="item-emoji">${menuItem.emoji}</i>
            </div>
            <div class="item-details-txt">
                <h2 class="no-bold no-margin-txt">${menuItem.name}</h2>
                <p class="no-margin-txt">${menuItem.ingredients.join(', ')}</p>
                <h4 class="no-bold item-details-price-txt no-margin-txt">$${menuItem.price}</h4>
            </div>
            <button class="add-item pointer-cursor-hover" data-menu-id-add="${menuItem.id}">+</button>
        </section>
        `
    ).join('')
}

// When the modal is opened and shift key is pressed, the hover state outside of the
// modal changes to signify that the user can click there to close the modal.
document.addEventListener('keydown', (e)=>{
    if(e.key === 'Shift' && !isClassChanged && !isModalClosed()){
        toggleEverythingButModalHoverClass()
    }
})
document.addEventListener('keyup', (e)=>{
    if(e.key === 'Shift' && isClassChanged && !isModalClosed()){
       toggleEverythingButModalHoverClass()
    }
})

document.addEventListener('click', function(e){
    const menuIdAdd = Number(e.target.dataset.menuIdAdd)
    const menuIdRemove = Number(e.target.dataset.menuIdRemove)

    // Modal can be closed when the modal is opened, the shift key is pressed, and the user clicks
    // anywhere outside of the modal.
    if(!isModalClosed() && e.shiftKey && !modal.contains(e.target)){
        closeModal()
    }

    // If the modal is opened or the use the user placed an order and did not click the place
    // a new order button, they can not modify their order.
    else if ((menuIdAdd || menuIdAdd === 0) && isModalClosed() && !isOrderPlaced){
        modifyOrder(menuIdAdd, true)
    }

    else if ((menuIdRemove || menuIdRemove === 0) && isModalClosed() && !isOrderPlaced){
        modifyOrder(menuIdRemove, false)
    }

    // If the modal is opened, the user can not click the complete order button.
    else if ((e.target.id === 'complete-order-btn') && isModalClosed()){
        displayModal()
    }

    else if (e.target.id === 'place-new-order-btn'){
        newOrder()
    }
})

function isModalClosed(){
    return modal.classList.contains('hide-container')
}

function displayModal(){
    modal.classList.remove('hide-container')
    document.querySelector('body').classList.add('no-scroll')
    toggleElementsClass(document.querySelectorAll('button:not(#modal *)'), 'pointer-cursor-hover')
}

// When the user requests a new order, the text confirming that their order has
// been placed clears and the user can add items to order again.
function newOrder(){
    orderDetails = resetOrderDetails()
    renderOrderedItems()
    toggleElementsClass(document.getElementsByClassName('add-item'), 'pointer-cursor-hover')
    isOrderPlaced = false
}

// Function to reset the orderDetails array, so the user has not ordered any
// of the menu items and the total price of each item is 0
function resetOrderDetails(){
    return menuArray.map( ( {name, id} )=>{
        return {
            itemName: name,
            itemId: id,
            numOrdered: 0,
            totalPriceItemOrdered: 0,
        }
    })
}

function modifyOrder(menuId, isAdd){
    const {price} = menuArray.filter(item=>item.id === menuId)[0]
    const itemOrderDetails = orderDetails.filter(
        ( {itemId} )=>itemId === menuId
    )[0]

    itemOrderDetails.numOrdered = isAdd ? itemOrderDetails.numOrdered + 1
    : itemOrderDetails.numOrdered - 1

    itemOrderDetails.totalPriceItemOrdered = isAdd ? itemOrderDetails.totalPriceItemOrdered + price
    : itemOrderDetails.totalPriceItemOrdered - price

    renderOrderedItems()
}

function renderOrderedItems(){
    orderDetailsSection.innerHTML = ''
    const totalPrice = orderDetails.reduce(
        (totalPrice, { totalPriceItemOrdered })=>totalPrice+totalPriceItemOrdered
    , 0)

    if(totalPrice > 0){
        const yourOrderContainer = document.createElement('div')
        yourOrderContainer.classList.add('order-details-container', 'your-order-container', 'black-border-bottom')
        yourOrderContainer.innerHTML = getOrderedItemsHtml()
        orderDetailsSection.appendChild(yourOrderContainer)

        const totalPriceContainer = document.createElement('div')

        totalPriceContainer.classList.add('order-details-container', 'total-price-container')
        totalPriceContainer.innerHTML = `
            <div class="order-details-container-txt">
                <h2 class="no-margin-txt no-bold">Total Price:</h2>
                <h4 class="no-margin-txt no-bold">$${totalPrice}</h4>
            </div>
            <button class="order-btn pointer-cursor-hover" id="complete-order-btn">Complete Order</button>
        `
        orderDetailsSection.appendChild(totalPriceContainer)
    }
}

function getOrderedItemsHtml(){
    const yourOrderTitleHtml = `<h2 class="order-details-title no-bold">Your order</h2>`

    const orderedItemsHtml = orderDetails.map(itemOrderDetails=>{
        if (itemOrderDetails.numOrdered === 0){
            return ''
        }
        else{
            const numOrderedItemName = (itemOrderDetails.numOrdered>1) 
            ? `${itemOrderDetails.numOrdered} ${itemOrderDetails.itemName}s`
            : `${itemOrderDetails.numOrdered} ${itemOrderDetails.itemName}`

            return `
                <div class="order-details-container-txt">
                    <div class="item-name-remove-btn-container">
                        <h2 class="no-margin-txt no-bold">
                            ${numOrderedItemName}
                        </h2>
                        <button 
                            class="remove-item-from-order-btn pointer-cursor-hover"
                            data-menu-id-remove="${itemOrderDetails.itemId}"
                        >
                        remove
                        </button>
                    </div>
                    <h4 class="no-margin-txt no-bold">
                        $${itemOrderDetails.totalPriceItemOrdered}
                    </h4>
                </div>
            `
        }
    }).join('')

    return yourOrderTitleHtml + orderedItemsHtml
}

paymentForm.addEventListener('submit', submitPaymentForm)

function submitPaymentForm(e){
    e.preventDefault()
    const formData = new FormData(paymentForm)
    const name = formData.get('name-input')
    paymentForm.reset()

    closeModal()
    isOrderPlaced = true
    toggleElementsClass(document.getElementsByClassName('add-item'), 'pointer-cursor-hover')
    renderOrderCompletedMessage(name)
}

function closeModal(){
    modal.classList.add('hide-container')
    document.querySelector('body').classList.remove('no-scroll')
    toggleElementsClass(document.querySelectorAll('button:not(#modal *)'), 'pointer-cursor-hover')

    if(isClassChanged){
        toggleEverythingButModalHoverClass()
    }
}

function toggleEverythingButModalHoverClass(){
    const everythingButModal = document.querySelectorAll('*:not(head, head *, body, html, script, #modal, #modal *)')
    isClassChanged = !isClassChanged
    toggleElementsClass(everythingButModal, 'pointer-cursor-hover')
}

// Function to toggle the CSS class of a list of elements
function toggleElementsClass(elementsList, className){
    for (let element of elementsList){
        element.classList.toggle(className)
    }
}

function renderOrderCompletedMessage(name){
    orderDetailsSection.innerHTML = `
    <h2 class="order-placed-txt no-bold">Thanks ${ name }! Your order is on its way!</h2>
    <button class="order-btn pointer-cursor-hover" id="place-new-order-btn">Place a new order</button>
    `
}