chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
      cartHtml = request.source;
      chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        },
        tabs => {
            url = tabs[0].url;
            newUrl = url.split('/')[2];
            CsvTitle = '%23%2CLink%2CTitle%2CStatus%2CSeller%2CQuantity%2CCurrency%2CPrice%2COriginal-Price%2CShipping-Method%2CShipping-Cost%0A';
		  if (newUrl == "cart.ebay.com" || newUrl == "cart.payments.ebay.com") {
                scrapedData = scrapMatchDetails(cartHtml,CsvTitle).join('')
                if (scrapedData != CsvTitle) {
                    $('.excel').attr('href', 'data:application/csv;charset=utf-8,'+scrapedData);
                    $('#export-button').show(500);
                } else {
                    $('#cart-message').show(500);
                }
            } else {
                $('#alert-message').show(500);
            } 
        });
    }
});

function onWindowLoad() { 
	
chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, function(tabs) {
      var tab = tabs[0];
      var str = tab.url; 
	  
	newUrl = str.split('/')[2]; 
	
	if(newUrl == "newtab"){
	 $('#alert-message').show(500);
     return;
	}
	
      var n = str.search("cart.ebay.com");
	  var n1 = str.search("cart.payments.ebay.com");
	  var onCartPage = 0;
	
	if(n >= 0 || n1 >= 0)
	onCartPage = 1;
	
     if(!onCartPage){
        $('#alert-message').show(500);
        return;
	 }else{
    chrome.tabs.executeScript(null, {
        file: "assets/js/getPagesSource.js"
    });
    }
  });     	
	
}
function scrapMatchDetails(html,CsvTitle) {
    var productsList = new Array(CsvTitle);
    num=0
    $(html).find('.cart-bucket').each(function(key){ 
        cartBucket = $(this).attr('data-test-info')
        store = JSON.parse(cartBucket).sellerId
        $(this).find('.cart-bucket-lineitem').each(function(n){
            num++
            title = $(this).find('.BOLD').text().replace(/,/g, " |").replace(/ /g, "%20")
            url = $(this).find('.item-title').find('a').attr('href')
 
            currency = $(this).find('.item-price').text().split(' ')
            
            if (currency[1]) {
                currencySign = $(this).find('.item-price').text().split(' ')[1].slice(0,1) 
                price = $(this).find('.STRIKETHROUGH').text().split(' ')[1] 
                extendPrice = $(this).find('.item-price').text().split(' ')[1]
            } else {
                currencySign = $(this).find('.item-price').text().split(' ')[0].slice(0,1) 
                price = $(this).find('.STRIKETHROUGH').text().split(' ')[0] 
                extendPrice = $(this).find('.item-price').text().split(' ')[0]
            }
            currency = currency[1] ? currency[0] +"%20"+ currencySign : currencySign 
            price = price ? price.slice(1).replace(/,/g, "") : ''
            extendPrice = extendPrice ? extendPrice.slice(1).replace(/,/g, "") : ''

            status = $(this).find('.item-condition').text().replace(/,/g, " |").replace(/ /g, "%20")
            statusHotness = $(this).find('.item-hotness').find('.clipped').text().replace(/,/g, " |").replace(/ /g, "%20")
            productStatus = status+'%20' +statusHotness

            quantitySelectOption = $(this).find('.listbox__control').val()
            quantityText = $(this).find('.quantity-display').find('.clipped').text().split(' ')[2]
            quantity = quantitySelectOption ? quantitySelectOption : quantityText
            
            shippingMethod = $(this).find('.logistics-details').text().replace(/,/g, " |").replace(/ /g, "%20")
            shippingCost = $(this).find('.logistics-costs').text().split(' ')[2]
            shippingCost = shippingCost ? shippingCost.slice(1) : ''

            
            // CsvTitle = '%23%2CLink%2CTitle%2CStatus%2CSeller%2CQuantity%2CCurrency%2CPrice%2COriginal-Price%2CShipping-Method%2CShipping-Cost%0A';
            productsList.push(num+'%2C'+url+'%2C'+title+'%2C'+productStatus+'%2C'+store+'%2C'+quantity+'%2C'+currency+'%2C'+extendPrice+'%2C'+price+'%2C'+shippingMethod+'%2C'+shippingCost+'%0A')

        });
    });
    return productsList
}
window.onload = onWindowLoad;