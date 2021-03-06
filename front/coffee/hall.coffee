@.taigaContribPlugins = @.taigaContribPlugins or []

hallInfo = {
    slug: "hall"
    name: "Hall"
    type: "admin"
    module: 'taigaContrib.hall'
}

@.taigaContribPlugins.push(hallInfo)

module = angular.module('taigaContrib.hall', [])

debounce = (wait, func) ->
    return _.debounce(func, wait, {leading: true, trailing: false})

initHallPlugin = ($tgUrls) ->
    $tgUrls.update({
        "hall": "/hall"
    })

class HallAdmin
    @.$inject = [
        "$rootScope",
        "$scope",
        "$tgRepo",
        "tgAppMetaService",
        "$tgConfirm",
        "$tgHttp",
    ]

    constructor: (@rootScope, @scope, @repo, @appMetaService, @confirm, @http) ->
        @scope.sectionName = "Hall" # i18n
        @scope.sectionSlug = "hall"

        @scope.$on "project:loaded", =>
            promise = @repo.queryMany("hall", {project: @scope.projectId})

            promise.then (hallhooks) =>
                @scope.hallhook = {project: @scope.projectId}
                if hallhooks.length > 0
                    @scope.hallhook = hallhooks[0]

                title = "#{@scope.sectionName} - Plugins - #{@scope.project.name}" # i18n
                description = @scope.project.description
                @appMetaService.setAll(title, description)

            promise.then null, =>
                @confirm.notify("error")

    testHook: () ->
        promise = @http.post(@repo.resolveUrlForModel(@scope.hallhook) + '/test')
        promise.success (_data, _status) =>
            @confirm.notify("success")
        promise.error (data, status) =>
            @confirm.notify("error")

module.controller("ContribHallAdminController", HallAdmin)

HallWebhooksDirective = ($repo, $confirm, $loading) ->
    link = ($scope, $el, $attrs) ->
        form = $el.find("form").checksley({"onlyOneErrorElement": true})
        submit = debounce 2000, (event) =>
            event.preventDefault()

            return if not form.validate()

            currentLoading = $loading()
                .target(submitButton)
                .start()

            if not $scope.hallhook.id
                promise = $repo.create("hall", $scope.hallhook)
                promise.then (data) ->
                    $scope.hallhook = data
            else if $scope.hallhook.url
                promise = $repo.save($scope.hallhook)
                promise.then (data) ->
                    $scope.hallhook = data
            else
                promise = $repo.remove($scope.hallhook)
                promise.then (data) ->
                    $scope.hallhook = {project: $scope.projectId}

            promise.then ->
                currentLoading.finish()
                $confirm.notify("success")

            promise.then null, (data) ->
                currentLoading.finish()
                form.setErrors(data)
                if data._error_message
                    $confirm.notify("error", data._error_message)

        submitButton = $el.find(".submit-button")

        $el.on "submit", "form", submit
        $el.on "click", ".submit-button", submit

    return {link:link}

module.directive("contribHallWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", HallWebhooksDirective])

module.run(["$tgUrls", initHallPlugin])
