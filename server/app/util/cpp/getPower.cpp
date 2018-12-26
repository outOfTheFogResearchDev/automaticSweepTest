#include <node.h>

using namespace v8;

void getPower(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();

    //* C++ starts here

    int power = 0;

    //* C++ ends here

    args.GetReturnValue().Set(Number::New(isolate, power));
}

void init(Local<Object> exports, Local<Object> method)
{
    NODE_SET_METHOD(method, "exports", getPower);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);