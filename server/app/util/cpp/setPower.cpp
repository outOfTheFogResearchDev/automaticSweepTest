#include <node.h>

using namespace v8;

void setPower(const FunctionCallbackInfo<Value> &args)
{
    Isolate *isolate = args.GetIsolate();
    int power = args[0].As<Number>()->Value();

    //* C++ starts here

    //* C++ ends here
}

void init(Local<Object> exports, Local<Object> method)
{
    NODE_SET_METHOD(method, "exports", setPower);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, init);