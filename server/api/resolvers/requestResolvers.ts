import { Request, RequestInterface } from '../../database/models/requestModel'
import { RequestType, RequestTypeInterface } from '../../database/models/requestTypeModel'

import { sessionHandler } from '../utils/session'

const requestEmbeddingFromRequest = ( request: RequestInterface ) => {
    return {
        _id: request._id,
        createdAt: request.createdAt ? request.createdAt : null,
        deletedAt: request.deletedAt ? request.deletedAt : null,
        fulfilledAt: request.fulfilledAt ? request.fulfilledAt : null
    }
}

const swapRequestTypeForRequest = async ( request, oldRequestTypeID, newRequestTypeID, session ) => {
    const oldRequestType = await RequestType.findById(oldRequestTypeID).session(session)
    oldRequestType.requests = oldRequestType.requests.filter((requestEmbedding) => {
        return requestEmbedding._id !== request._id
    })

    const newRequestType = await RequestType.findById(newRequestTypeID).session(session)
    newRequestType.requests.push(requestEmbeddingFromRequest(request))

    await oldRequestType.save({ session: session })
    await newRequestType.save({ session: session })
}

const requestQueryResolvers = {
    request: async (_, { _id }, ___): Promise<RequestInterface> => {
        return Request.findById(_id).exec()
    },
    requests: async (_, __, ___): Promise<Array<RequestInterface>> => {
        return Request.find().exec()
    },
    requestsPage: async (_, { skip, limit }, __): Promise<Array<RequestInterface>> => {
        return Request.find().sort({ "name": "ascending", "_id": "ascending" }).skip(skip).limit(limit).exec()
    },
    /* Left as a proof of concept:
    requestsFilter: async (_, { filter, options }, ___): Promise<Array<RequestInterface>> => {
        return Request.find().exec()
    },*/
}

const requestMutationResolvers = {
    createRequest: async (_, { request }, { authenticateUser }): Promise<RequestInterface> => {
        return authenticateUser().then(async () => { 
            return sessionHandler(async (session) => {
                const newRequestObject = new Request({...request})
                const newRequest = await newRequestObject.save({ session: session })
                
                const requestType = await RequestType.findById(newRequest.requestType).session(session)
                requestType.requests.push(requestEmbeddingFromRequest(newRequest))
                await requestType.save({ session: session })

                return newRequest
            })
        })
    },
    updateRequest: async (_, { request }, { authenticateUser }): Promise<RequestInterface> => {
        return authenticateUser().then(async () => {
            return sessionHandler(async (session) => {
                const oldRequest = await Request.findById(request._id).session(session)
                const modifiedRequestObject = new Request({...oldRequest, ...request})
                const newRequest = await modifiedRequestObject.save({ session: session })

                if (oldRequest.requestType !== newRequest.requestType) {
                    swapRequestTypeForRequest(newRequest, oldRequest.requestType, newRequest.requestType, session)
                }

                return newRequest
            })
        })
    },
    deleteRequest: async (_, { _id }, { authenticateUser }): Promise<RequestInterface> => {
        return authenticateUser().then(async () => {
            const request = await Request.findById(_id)
            request.deletedAt = new Date()
            return request.save()
        })
    },
    fulfillRequest: async (_, { _id }, { authenticateUser }): Promise<RequestInterface> => {
        return authenticateUser().then(async () => {
            const request = await Request.findById(_id)
            request.fulfilledAt = new Date()
            return request.save()
        })
    },
    unfulfillRequest: async (_, { _id }, { authenticateUser }): Promise<RequestInterface> => {
        return authenticateUser().then(async () => {
            const request = await Request.findById(_id)
            request.fulfilledAt = undefined
            return request.save()
        })
    },
    changeRequestTypeForRequest: async (_, { requestId, requestTypeId }, { authenticateUser }): Promise<RequestInterface> => {
        return authenticateUser().then(async () => {
            return sessionHandler(async (session) => {
                const modifiedRequestObject = await Request.findById(requestId).session(session)

                if (modifiedRequestObject.requestType !== requestTypeId) {
                    swapRequestTypeForRequest(modifiedRequestObject, requestTypeId, modifiedRequestObject.requestType, session)
                }

                modifiedRequestObject.requestType = requestTypeId
                return modifiedRequestObject.save({ session: session })
            })
        })
    },
}

const requestResolvers = {
    requestType: async (parent, __, ___): Promise<RequestTypeInterface> => {
        return RequestType.findById(parent.requestType)
    },
    deleted: (parent, __, ___): boolean => {
        return parent.deletedAt !== undefined
    },
    fulfilled: (parent, __, ___): boolean => {
        return parent.fulfilledAt !== undefined
    },
}

export { requestQueryResolvers, requestMutationResolvers, requestResolvers }
