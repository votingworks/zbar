#include <napi.h>
#include <zbar.h>

using namespace zbar;

static zbar_processor_t *processor = NULL;

/**
 * Detects QR codes in an image. Expects raw image data (Buffer or typed array),
 * a width, and a height.
 */
Napi::Value DetectQRCode(const Napi::CallbackInfo &info)
{
  auto env = info.Env();

  if (info.Length() != 3)
  {
    Napi::TypeError::New(env, "Expected image data (Buffer or typed array), a width, and a height")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  auto arg0 = info[0];

  if (!arg0.IsTypedArray())
  {
    Napi::TypeError::New(env, "Expected image data (Buffer or typed array)")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  auto typed_array = arg0.As<Napi::TypedArray>();
  auto qrdata = (uint8_t *)typed_array.ArrayBuffer().Data();
  auto qrdata_offset = typed_array.ByteOffset();
  auto qrdata_length = typed_array.ByteLength();

  auto width = info[1].As<Napi::Number>().Uint32Value();
  auto height = info[2].As<Napi::Number>().Uint32Value();

  auto *qrdata_grayscale = (uint8_t *)malloc(width * height);
  auto offset_grayscale = 0;

  for (auto offset = qrdata_offset; offset < qrdata_offset + qrdata_length; offset += 4)
  {
    auto r = qrdata[offset];
    auto g = qrdata[offset + 1];
    auto b = qrdata[offset + 2];
    qrdata_grayscale[offset_grayscale++] = (uint8_t)(0.21 * r + 0.72 * g + 0.07 * b);
  }

  if (!processor)
  {
    processor = zbar_processor_create(0);

    if (!processor)
    {
      free(qrdata_grayscale);
      Napi::TypeError::New(env, "zbar_processor_create() failed")
          .ThrowAsJavaScriptException();
      return env.Undefined();
    }

    if (zbar_processor_init(processor, NULL, 0))
    {
      free(qrdata_grayscale);
      zbar_processor_error_spew(processor, 0);
      Napi::TypeError::New(env, "zbar_processor_init() failed")
          .ThrowAsJavaScriptException();
      return env.Undefined();
    }
  }

  auto zimage = zbar_image_create();

  if (!zimage)
  {
    free(qrdata_grayscale);
    Napi::TypeError::New(env, "zbar_image_create() failed")
        .ThrowAsJavaScriptException();
    return env.Undefined();
  }

  zbar_image_set_format(zimage, zbar_fourcc('Y', '8', '0', '0'));
  zbar_image_set_size(zimage, width, height);
  zbar_image_set_data(zimage, qrdata_grayscale, width * height, NULL);
  zbar_process_image(processor, zimage);

  auto result = Napi::Array::New(env);
  auto result_index = 0;
  auto sym = zbar_image_first_symbol(zimage);
  for (; sym; sym = zbar_symbol_next(sym))
  {
    auto typ = zbar_symbol_get_type(sym);
    auto len = zbar_symbol_get_data_length(sym);

    if (typ == ZBAR_PARTIAL)
      continue;

    auto qrcode_object = Napi::Object::New(env);
    qrcode_object.Set(Napi::String::New(env, "type"), Napi::Number::New(env, zbar_symbol_get_type(sym)));
    qrcode_object.Set(Napi::String::New(env, "data"), Napi::Buffer<char>::Copy(env, zbar_symbol_get_data(sym), len));
    qrcode_object.Set(Napi::String::New(env, "orientation"), Napi::Number::New(env, zbar_symbol_get_orientation(sym)));

    auto loc_count = zbar_symbol_get_loc_size(sym);
    auto locs = Napi::Array::New(env, loc_count);

    for (auto loc_index = 0; loc_index < loc_count; loc_index++)
    {
      auto loc = Napi::Object::New(env);
      loc.Set(Napi::String::New(env, "x"), Napi::Number::New(env, zbar_symbol_get_loc_x(sym, loc_index)));
      loc.Set(Napi::String::New(env, "y"), Napi::Number::New(env, zbar_symbol_get_loc_y(sym, loc_index)));
      locs.Set(Napi::Number::New(env, loc_index), loc);
    }

    qrcode_object.Set(Napi::String::New(env, "locations"), locs);
    qrcode_object.Set(Napi::String::New(env, "quality"), Napi::Number::New(env, zbar_symbol_get_quality(sym)));

    result.Set(Napi::Number::New(env, result_index++), qrcode_object);
  }

  zbar_image_destroy(zimage);
  free(qrdata_grayscale);
  return result;
}

/**
 * Initializes the module by exporting the appropriate values.
 */
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  unsigned major, minor, patch;
  zbar_version(&major, &minor, &patch);
  char version_str[255];
  snprintf(version_str, sizeof(version_str), "%d.%d.%d", major, minor, patch);

  exports.Set(Napi::String::New(env, "version"),
              Napi::String::New(env, version_str));
  exports.Set(Napi::String::New(env, "detect"),
              Napi::Function::New(env, DetectQRCode));
  return exports;
}

NODE_API_MODULE(qrdetect, Init)