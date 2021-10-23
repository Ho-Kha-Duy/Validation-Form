// Đối tượng Validator
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}

    // Hàm thực hiện
    function Validate (inputElement, rule) {
        var errorMessage
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        
        var rules = selectorRules[rule.selector]

        // Lặp qua từng rule và kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formELement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return !!errorMessage
    }

    // Lấy element của form
    var formELement = document.querySelector(options.form);
    if (formELement) {
        // Khi submit
        formELement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true;

            options.rules.forEach(function (rule) {
                var inputElement = formELement.querySelector(rule.selector)
                var isValid = Validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formELement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formELement.querySelector('input[name="' + input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }

                        return values
                    }, {})
                    options.onSubmit(formValues)
                } else {
                    formELement.submit()
                }
            }
        }


        // Sự kiện lặp qua mỗi rule
        options.rules.forEach(function (rule) {
            
            // Lưu các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
            
            var inputElements = formELement.querySelectorAll(rule.selector)
            
            Array.from(inputElements).forEach(function (inputElement) {
                // Xử lý blur
                inputElement.onblur = function () {
                    Validate(inputElement, rule)
                }

                // Xử lý khi nhập
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })
    }
}

// Định nghĩa rules

Validator.isRequired = function (selector, massage) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : massage || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, massage) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : massage || 'Email không hợp lệ'
        }
    }
}

Validator.minLength = function (selector, min, massage) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : massage || `Tối thiểu ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, massage) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : massage || 'Gía trị nhập vào không chính xác'
        }
    }
}