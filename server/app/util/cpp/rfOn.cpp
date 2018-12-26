#include <node.h>

using namespace v8;

void rfOn(const FunctionCallbackInfo<Value> &args)
{

    //* C++ starts here

    //* C++ ends here
}

void init(Local<Object> exports, Local<Object> method)
{
    NODE_SET_METHOD(method, "exports", rfOn);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);